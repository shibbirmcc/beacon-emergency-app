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

public class GoogleMapActivity extends FragmentActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private ActivityGoogleMapBinding binding;

    private Database database;
    private FusedLocationProviderClient fusedLocationClient;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1;

    private FloatingActionButton floatingActionButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        CouchbaseLite.init(getApplicationContext());

        binding = ActivityGoogleMapBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        try {
            DatabaseConfiguration config = new DatabaseConfiguration();
            database = new Database("beacon-db", config);
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
        }

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        floatingActionButton = findViewById(R.id.fab_add_request);
        floatingActionButton.setOnClickListener(v -> showEmergencyDialog());
    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            Log.d("Location Enabled", "Going to current location");
            mMap.setMyLocationEnabled(true);

            fusedLocationClient.getLastLocation()
                    .addOnSuccessListener(this, location -> {
                        if (location != null) {
                            LatLng userLocation = new LatLng(location.getLatitude(), location.getLongitude());
                            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(userLocation, 15));
                            loadResponders();
                        }
                    });

        } else {
            Log.d("Location Disabled", "Requesting Permission");
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


    private void insertExampleResponder() {
        MutableDocument doc = new MutableDocument("responder_001");
        doc.setString("type", "user");
        doc.setString("user_id", "responder_001");
        doc.setString("user_type", "responder");
        doc.setString("response_type", "Ambulance");
        doc.setString("status", "active");

        MutableDictionary location = new MutableDictionary();
        location.setDouble("lat", 59.3325);
        location.setDouble("lon", 18.0649);
        doc.setDictionary("location", location);

        try {
            database.save(doc);
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
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

                LatLng responderLocation = new LatLng(location.getDouble("lat"), location.getDouble("lon"));

                MarkerOptions markerOptions = new MarkerOptions()
                        .position(responderLocation)
                        .title(responseType)
                        .icon(BitmapDescriptorFactory.defaultMarker(
                                status.equals("active") ? BitmapDescriptorFactory.HUE_GREEN : BitmapDescriptorFactory.HUE_RED
                        ));

                mMap.addMarker(markerOptions);
            }

        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
        }
    }

    private void showEmergencyDialog() {
        String[] options = {"Ambulance", "Doctor", "Fire Truck", "Rescue Team", "Generator", "Water Supply"};

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Select Emergency Type");
        builder.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, options), (dialog, which) -> {
            String selected = options[which];
            saveEmergencyRequest(selected);
            Toast.makeText(this, "Emergency Request for " + selected + " sent!", Toast.LENGTH_SHORT).show();
        });
        builder.show();
    }

    private void saveEmergencyRequest(String emergencyType) {
        MutableDocument doc = new MutableDocument();
        doc.setString("type", "emergency_request");
        doc.setString("request_id", doc.getId());
        doc.setString("requested_by", "user_98765");
        doc.setString("emergency_type", emergencyType);
        doc.setString("status", "open");

        // Example location (replace with real location if needed)
        MutableDictionary location = new MutableDictionary();
        location.setDouble("lat", 59.3333);
        location.setDouble("lon", 18.0650);
        doc.setDictionary("location", location);

        try {
            database.save(doc);
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
        }
    }
}