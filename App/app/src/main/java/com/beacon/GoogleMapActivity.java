package com.beacon;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.app.AlertDialog;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import com.couchbase.lite.*;
import com.couchbase.lite.Collection;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.beacon.databinding.ActivityGoogleMapBinding;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

public class GoogleMapActivity extends AppCompatActivity implements OnMapReadyCallback {

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1;
    private static final String SYNC_GATEWAY_IP = "172.23.47.108"; ///zerotier vpn

    private static final String USER_ID = "99";
    private static final String USER_TYPE = "responder"; // requester
    private static final String RESPONDER_TYPE = "Ambulance"; // if we use responder user

    private GoogleMap mMap;
    private ActivityGoogleMapBinding binding;
    private Database database;
    private FusedLocationProviderClient fusedLocationClient;
    private FloatingActionButton floatingActionButton;
    private Replicator sgwReplicator;
    private URLEndpointListener p2pListener;
    private SyncGatewayConflictResolver syncGatewayConflictResolver = new SyncGatewayConflictResolver();
    private P2PConflictResolver p2PConflictResolver = new P2PConflictResolver();
    private PeerDiscoveryManager peerDiscovery;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        CouchbaseLite.init(getApplicationContext());

        binding = ActivityGoogleMapBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        peerDiscovery = new PeerDiscoveryManager(this);
        try {
            DatabaseConfiguration config = new DatabaseConfiguration();
            database = new Database("beacon", config);

            deleteCouchbaseLiteDataOnStartup();

            startP2pListener();
            startContinuousP2pReplicationToPeers();
            startSyncGatewayReplication();

            peerDiscovery.registerService(p2pListener.getPort());
        } catch (Exception e) {
            e.printStackTrace();
        }

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        floatingActionButton = findViewById(R.id.fab_add_request);

        if("responder".equals(USER_TYPE)){
            floatingActionButton.setVisibility(View.INVISIBLE);
            setTitle("Responder - "+USER_ID);
            try {
                startResponderRequestListener(RESPONDER_TYPE, USER_ID);
            } catch (CouchbaseLiteException e) {
                Log.e("RESPONDER Request Listener", "Request Listening error", e);
            }
        }else {
            setTitle("Requester - "+USER_ID);
            floatingActionButton.setVisibility(View.VISIBLE);
            floatingActionButton.setOnClickListener(v -> showEmergencyDialog());
        }
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            mMap.setMyLocationEnabled(true);
            fusedLocationClient.getLastLocation().addOnSuccessListener(this, location -> {
                if (location != null) {
                    LatLng userLoc = new LatLng(location.getLatitude(), location.getLongitude());
                    mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(userLoc, 13));
                }
            });
            peerDiscovery.discoverPeers();
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    LOCATION_PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
//                onMapReady(mMap);
                Log.i("PERMISSION", "Location permission granted");
            } else {
                Toast.makeText(this, "Location permission is required", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void showEmergencyDialog() {
        String[] options = {"Ambulance", "Doctor", "Fire Truck", "Rescue Team", "Generator", "Water Supply"};
        new AlertDialog.Builder(this)
                .setTitle("Select Emergency Type")
                .setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, options), (dialog, which) -> {
                    String selected = options[which];
                    saveAndSendEmergencyRequest(selected);
                })
                .show();
    }

    private void saveAndSendEmergencyRequest(String emergencyType) {
        try {
            Collection collection = database.getDefaultCollection();
            MutableDocument doc = new MutableDocument();
            doc.setString("type", "emergency_request");
            doc.setString("emergency_type", emergencyType);
            doc.setString("city", "stockholm");
            doc.setString("status", "open");
            doc.setString("requested_by", USER_ID);
            doc.setLong("requested_at", System.currentTimeMillis());
            collection.save(doc);
            Log.d("EMERGENCY_DOC", "Emergency type: " + doc.getString("emergency_type"));
            Toast.makeText(this, "Emergency Request saved & ready for sync!", Toast.LENGTH_SHORT).show();
        } catch (Exception e) { Log.e("EMERGENCY", "Save error", e); }
    }

    private void startP2pListener() throws CouchbaseLiteException {
        TLSIdentity serverIdentity = createServerIdentity();
        URLEndpointListenerConfiguration config = new URLEndpointListenerConfiguration(Set.of(database.getDefaultCollection()));
        config.setPort(55990);
        config.setDisableTls(false);
        config.setTlsIdentity(serverIdentity);
        config.setAuthenticator(new ListenerCertificateAuthenticator(List.of(serverIdentity.getCerts().get(0))));

        p2pListener = new URLEndpointListener(config);
        p2pListener.start();
        Log.i("P2P_LISTENER", "P2P Listener running: " + p2pListener.getUrls());
    }

    private void startContinuousP2pReplicationToPeers() throws CouchbaseLiteException {
        TLSIdentity clientIdentity = createClientIdentity();
        for (URI peerUri : peerDiscovery.getNearbyPeerUris()) {
            URLEndpoint endpoint = new URLEndpoint(peerUri);
            ReplicatorConfiguration config = new ReplicatorConfiguration(endpoint);
            Collection collection = database.getDefaultCollection();

            config.addCollection(collection, null);
            config.setType(ReplicatorType.PUSH_AND_PULL);
            config.setContinuous(true);
            config.setAuthenticator(new ClientCertificateAuthenticator(clientIdentity));

            // Configuring the channel to read from
            CollectionConfiguration collectionConfiguration = new CollectionConfiguration();
            // TODO: update the channel names once sync-gateway is configured properly with city based channel names
            collectionConfiguration.setChannels(List.of("emergency_requests"));
            // conflict resolver
            collectionConfiguration.setConflictResolver(p2PConflictResolver);
            config.addCollection(collection, collectionConfiguration);



            Replicator repl = new Replicator(config);
//            repl.addChangeListener(change -> Log.i("P2P_REPL", "Status: " + change.getStatus()));
            repl.addChangeListener(change -> {
                ReplicatorStatus status = change.getStatus();
                Log.i("P2P_REPLICATOR", "ActivityLevel: " + status.getActivityLevel());
                if (status.getError() != null) {
                    Log.e("P2P_REPLICATOR", "Replication error: " + status.getError());
                }
            });
            repl.start();
        }
    }

    private void startSyncGatewayReplication() throws URISyntaxException, CouchbaseLiteException {
        URI sgwUri = new URI("ws://"+SYNC_GATEWAY_IP+":4984/beacon");
        URLEndpoint endpoint = new URLEndpoint(sgwUri);
        ReplicatorConfiguration config = new ReplicatorConfiguration(endpoint);
        config.addCollection(database.getDefaultCollection(), null);
        config.setType(ReplicatorType.PUSH_AND_PULL);
        config.setContinuous(true);

        // Configuring the channel to read from
        Collection collection = database.getDefaultCollection();
        CollectionConfiguration collectionConfiguration = new CollectionConfiguration();
        collectionConfiguration.setChannels(List.of("emergency_requests"));
        // conflict resolver
        collectionConfiguration.setConflictResolver(syncGatewayConflictResolver);
        config.addCollection(collection, collectionConfiguration);


        sgwReplicator = new Replicator(config);
        sgwReplicator.addChangeListener(change -> {
            ReplicatorStatus status = change.getStatus();
            Log.i("SGW_REPL", "Activity Level: " + status.getActivityLevel());
            Log.i("SGW_REPL", "Last Sequence: " + status.getProgress().getCompleted());
            Log.i("SGW_REPL", String.format("Progress: %d / %d",
                    status.getProgress().getCompleted(),
                    status.getProgress().getTotal()));
            if (change.getStatus().getError() != null) {
                Log.e("SGW_REPL", "Error: " + change.getStatus().getError());
            }
        });
        sgwReplicator.start();
    }

    private TLSIdentity createServerIdentity() throws CouchbaseLiteException {
        TLSIdentity existingIdentity = TLSIdentity.getIdentity("server-key");
        if (existingIdentity != null) {
            Log.i("TLS_IDENTITY", "Existing server identity found, reusing it");
            return existingIdentity;
        }

        Map<String, String> attrs = Map.of(TLSIdentity.CERT_ATTRIBUTE_COMMON_NAME, "BeaconServer");
        Calendar cal = Calendar.getInstance(); cal.add(Calendar.YEAR, 5);
        return TLSIdentity.createIdentity(true, attrs, cal.getTime(), "server-key");
    }

    private TLSIdentity createClientIdentity() throws CouchbaseLiteException {
        TLSIdentity existingIdentity = TLSIdentity.getIdentity("client-key");
        if (existingIdentity != null) {
            Log.i("TLS_IDENTITY", "Existing client identity found, reusing it");
            return existingIdentity;
        }

        Map<String, String> attrs = Map.of(TLSIdentity.CERT_ATTRIBUTE_COMMON_NAME, "BeaconClient");
        Calendar cal = Calendar.getInstance(); cal.add(Calendar.YEAR, 5);
        return TLSIdentity.createIdentity(false, attrs, cal.getTime(), "client-key");
    }


    private void startResponderRequestListener(String responderType, String responderId) throws CouchbaseLiteException {
        Query query = QueryBuilder
                .select(SelectResult.expression(Meta.id), SelectResult.all())
                .from(DataSource.collection(database.getDefaultCollection()))
                .where(
                        Expression.property("type").equalTo(Expression.string("emergency_request"))
                                .and(Expression.property("status").equalTo(Expression.string("open")))
                                .and(Expression.property("emergency_type").equalTo(Expression.string(responderType)))
                );

        // 1. Query existing matching documents immediately on startup
        ResultSet resultSet = query.execute();
        for (Result result : resultSet) {
            String docId = result.getString("id");
            Log.i("RESPONDER", "Matching emergency found on startup: " + docId);
            runOnUiThread(() -> showResponderNotification(docId, responderId));
        }

        // Add listener: runs whenever a matching doc changes
        query.addChangeListener(change -> {
            for (Result result : change.getResults()) {
                String docId = result.getString("id");
                Log.i("RESPONDER", "[ChangeListener] New/changed emergency: " + docId);
                runOnUiThread(() -> showResponderNotification(docId, responderId));
            }
        });
    }


    private void showResponderNotification(String docId, String responderId) {
        new AlertDialog.Builder(this)
                .setTitle("Emergency Request")
                .setMessage("A new request needs your response. Accept?")
                .setPositiveButton("Accept", (dialog, which) -> acceptEmergencyRequest(docId, responderId))
                .setNegativeButton("Reject", (dialog, which) -> Log.i("RESPONDER", "Request rejected"))
                .show();
    }


    private void acceptEmergencyRequest(String docId, String responderId) {
        try {
            Collection collection = database.getDefaultCollection();
            Document doc = collection.getDocument(docId);
            if (doc == null) {
                Log.e("RESPONDER", "Request doc not found: " + docId);
                return;
            }

            MutableDocument updated = doc.toMutable();
            updated.setString("status", "responded");
            updated.setString("responded_by", responderId);
            updated.setLong("responded_at", System.currentTimeMillis());

            collection.save(updated);
            Log.i("RESPONDER", "Accepted request " + docId);

        } catch (CouchbaseLiteException e) {
            Log.e("RESPONDER", "Error updating request", e);
        }
    }




    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (sgwReplicator != null) sgwReplicator.stop();
        if (p2pListener != null) p2pListener.stop();
    }



    // very dangerous, remember this part before starting the app for demo
    private void deleteCouchbaseLiteDataOnStartup(){
        try {
            Collection collection = database.getDefaultCollection();

            Query allDocs = QueryBuilder
                    .select(SelectResult.expression(Meta.id))
                    .from(DataSource.collection(collection));

            ResultSet results = allDocs.execute();
            int count = 0;
            for (Result result : results) {
                String docId = result.getString("id");
                Document doc = collection.getDocument(docId);
                collection.delete(doc);
                count++;
            }
            Log.i("DB_RESET", "Deleted " + count + " documents from local database on startup.");
        } catch (CouchbaseLiteException e) {
            Log.e("DB_RESET", "Error deleting documents on startup", e);
        }
    }
}
