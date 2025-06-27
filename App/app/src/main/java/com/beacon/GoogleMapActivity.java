package com.beacon;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import android.Manifest;
import android.app.AlertDialog;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import com.couchbase.lite.*;
import com.couchbase.lite.Collection;
import com.couchbase.lite.Dictionary;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.beacon.databinding.ActivityGoogleMapBinding;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.net.URI;
import java.net.URISyntaxException;
import java.security.cert.Certificate;
import java.util.*;

public class GoogleMapActivity extends FragmentActivity implements OnMapReadyCallback {

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1;

    private GoogleMap mMap;
    private ActivityGoogleMapBinding binding;
    private Database database;
    private FusedLocationProviderClient fusedLocationClient;
    private FloatingActionButton floatingActionButton;
    private Replicator sgwReplicator;
    private URLEndpointListener p2pListener;
    private SyncGatewayConflictResolver syncGatewayConflictResolver = new SyncGatewayConflictResolver();
    private P2PConflictResolver p2PConflictResolver = new P2PConflictResolver();


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        CouchbaseLite.init(getApplicationContext());

        binding = ActivityGoogleMapBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        try {
            DatabaseConfiguration config = new DatabaseConfiguration();
            database = new Database("beacon", config);

            startP2pListener();
            startContinuousP2pReplicationToPeers();
            startSyncGatewayReplication();
        } catch (Exception e) {
            e.printStackTrace();
        }

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        floatingActionButton = findViewById(R.id.fab_add_request);
        floatingActionButton.setOnClickListener(v -> showEmergencyDialog());
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
                    loadResponders();
                }
            });
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
                onMapReady(mMap);
            } else {
                Toast.makeText(this, "Location permission is required", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void loadResponders() {
        Query query = QueryBuilder.select(SelectResult.all())
                .from(DataSource.database(database))
                .where(Expression.property("type").equalTo(Expression.string("user"))
                        .and(Expression.property("user_type").equalTo(Expression.string("responder"))));
        try {
            ResultSet rs = query.execute();
            for (Result result : rs) {
                Dictionary user = result.getDictionary("beacon-db");
                Dictionary location = user.getDictionary("location");
                String responseType = user.getString("response_type");
                String status = user.getString("status");
                LatLng responderLoc = new LatLng(location.getDouble("lat"), location.getDouble("lon"));
                MarkerOptions markerOptions = new MarkerOptions()
                        .position(responderLoc)
                        .title(responseType)
                        .icon(BitmapDescriptorFactory.defaultMarker(
                                status.equals("active") ? BitmapDescriptorFactory.HUE_GREEN : BitmapDescriptorFactory.HUE_RED
                        ));
                mMap.addMarker(markerOptions);
            }
        } catch (CouchbaseLiteException e) { e.printStackTrace(); }
    }

    private void showEmergencyDialog() {
        String[] options = {"Ambulance", "Doctor", "Fire Truck", "Rescue Team", "Generator", "Water Supply"};
        new AlertDialog.Builder(this)
                .setTitle("Select Emergency Type")
                .setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, options), (dialog, which) -> {
                    String selected = options[which];
                    saveAndSendEmergencyRequest(selected);
//                    Toast.makeText(this, "Emergency Request for " + selected + " sent!", Toast.LENGTH_SHORT).show();
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
        for (URI peerUri : getNearbyPeerUris()) {
            URLEndpoint endpoint = new URLEndpoint(peerUri);
            ReplicatorConfiguration config = new ReplicatorConfiguration(endpoint);
            Collection collection = database.getDefaultCollection();

            config.addCollection(collection, null);
            config.setType(ReplicatorType.PUSH_AND_PULL);
            config.setContinuous(true);
            config.setAuthenticator(new ClientCertificateAuthenticator(clientIdentity));

            // Configuring the channel to read from
            CollectionConfiguration collectionConfiguration = new CollectionConfiguration();
            // TODO: update the channle names once sync-gateway is configured properly with city based channel names
            collectionConfiguration.setChannels(List.of("stockholm_responders", "stcokholm-requests"));
            // conflict resolver
            collectionConfiguration.setConflictResolver(p2PConflictResolver);
            config.addCollection(collection, collectionConfiguration);

            Replicator repl = new Replicator(config);
            repl.addChangeListener(change -> Log.i("P2P_REPL", "Status: " + change.getStatus()));
            repl.start();
        }
    }

    private void startSyncGatewayReplication() throws URISyntaxException, CouchbaseLiteException {
        URI sgwUri = new URI("wss://172.23.47.108/beacon");
        URLEndpoint endpoint = new URLEndpoint(sgwUri);
        ReplicatorConfiguration config = new ReplicatorConfiguration(endpoint);
        config.addCollection(database.getDefaultCollection(), null);
        config.setType(ReplicatorType.PUSH_AND_PULL);
        config.setContinuous(true);

        // Configuring the channel to read from
        Collection collection = database.getDefaultCollection();
        CollectionConfiguration collectionConfiguration = new CollectionConfiguration();
        // TODO: update the channle names once sync-gateway is configured properly with city based channel names
        collectionConfiguration.setChannels(List.of("stockholm_responders", "stcokholm-requests"));
        // conflict resolver
        collectionConfiguration.setConflictResolver(syncGatewayConflictResolver);
        config.addCollection(collection, collectionConfiguration);


        sgwReplicator = new Replicator(config);
        sgwReplicator.addChangeListener(change -> {
            if (change.getStatus().getError() != null) {
                Log.e("SGW_REPL", "Error: " + change.getStatus().getError());
            }
            Log.i("SGW_REPL", "Status: " + change.getStatus());
        });
        sgwReplicator.start();
    }

    private TLSIdentity createServerIdentity() throws CouchbaseLiteException {
        Map<String, String> attrs = Map.of(TLSIdentity.CERT_ATTRIBUTE_COMMON_NAME, "BeaconServer");
        Calendar cal = Calendar.getInstance(); cal.add(Calendar.YEAR, 5);
        return TLSIdentity.createIdentity(true, attrs, cal.getTime(), "server-key");
    }

    private TLSIdentity createClientIdentity() throws CouchbaseLiteException {
        Map<String, String> attrs = Map.of(TLSIdentity.CERT_ATTRIBUTE_COMMON_NAME, "BeaconClient");
        Calendar cal = Calendar.getInstance(); cal.add(Calendar.YEAR, 5);
        return TLSIdentity.createIdentity(false, attrs, cal.getTime(), "client-key");
    }

    private List<URI> getNearbyPeerUris() {
        try {
            // Replace with mDNS discovery; this is hardcoded for testing
            // TODO, replace the ip address with the private vpn network's ip address once veryone is connected
            return List.of(new URI("wss://192.168.1.10:55990/"), new URI("wss://192.168.1.11:55990/"));
        } catch (Exception e) { e.printStackTrace(); }
        return Collections.emptyList();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (sgwReplicator != null) sgwReplicator.stop();
        if (p2pListener != null) p2pListener.stop();
    }
}
