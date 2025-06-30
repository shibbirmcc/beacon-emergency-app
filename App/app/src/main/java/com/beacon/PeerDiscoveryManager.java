package com.beacon;

import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PeerDiscoveryManager {
    private static final String TAG = "PeerDiscovery";
    private static final String SERVICE_TYPE = "_beaconp2p._tcp.";

    private final Context context;
    private final NsdManager nsdManager;
    private final List<URI> discoveredUris = new ArrayList<>();

    private NsdManager.RegistrationListener registrationListener;
    private NsdManager.DiscoveryListener discoveryListener;

    public PeerDiscoveryManager(@NonNull Context context) {
        this.context = context;
        this.nsdManager = (NsdManager) context.getSystemService(Context.NSD_SERVICE);
    }

    /**
     * Publish your own P2P listener over mDNS.
     */
    public void registerService(int port) {
        NsdServiceInfo serviceInfo = new NsdServiceInfo();
        serviceInfo.setServiceName("BeaconP2P-" + Build.MODEL);
        serviceInfo.setServiceType(SERVICE_TYPE);
        serviceInfo.setPort(port);

        registrationListener = new NsdManager.RegistrationListener() {
            @Override public void onServiceRegistered(NsdServiceInfo si) {
                Log.i(TAG, "Service registered: " + si);
            }
            @Override public void onRegistrationFailed(NsdServiceInfo si, int errorCode) {
                Log.e(TAG, "Registration failed: " + errorCode);
            }
            @Override public void onServiceUnregistered(NsdServiceInfo si) {
                Log.i(TAG, "Service unregistered: " + si);
            }
            @Override public void onUnregistrationFailed(NsdServiceInfo si, int errorCode) {
                Log.e(TAG, "Unregistration failed: " + errorCode);
            }
        };

        nsdManager.registerService(serviceInfo, NsdManager.PROTOCOL_DNS_SD, registrationListener);
    }

    /**
     * Discover nearby peers using mDNS / NSD.
     */
    public void discoverPeers() {
        discoveredUris.clear();

        discoveryListener = new NsdManager.DiscoveryListener() {
            @Override public void onDiscoveryStarted(String regType) {
                Log.i(TAG, "Discovery started");
            }

            @Override public void onServiceFound(NsdServiceInfo serviceInfo) {
                Log.i(TAG, "Service found: " + serviceInfo);
                nsdManager.resolveService(serviceInfo, new NsdManager.ResolveListener() {
                    @Override public void onServiceResolved(NsdServiceInfo resolvedInfo) {
                        String host = resolvedInfo.getHost().getHostAddress();
                        int port = resolvedInfo.getPort();
                        try {
                            URI uri = new URI("ws://" + host + ":" + port + "/");
                            Log.i(TAG, "Discovered peer URI: " + uri);
                            discoveredUris.add(uri);
                        } catch (Exception e) {
                            Log.e(TAG, "Error building URI", e);
                        }
                    }

                    @Override public void onResolveFailed(NsdServiceInfo si, int errorCode) {
                        Log.e(TAG, "Resolve failed: " + si + " error: " + errorCode);
                    }
                });
            }

            @Override public void onServiceLost(NsdServiceInfo serviceInfo) {
                Log.i(TAG, "Service lost: " + serviceInfo);
            }

            @Override public void onDiscoveryStopped(String serviceType) {
                Log.i(TAG, "Discovery stopped");
            }

            @Override public void onStartDiscoveryFailed(String serviceType, int errorCode) {
                Log.e(TAG, "Start discovery failed: " + errorCode);
                nsdManager.stopServiceDiscovery(this);
            }

            @Override public void onStopDiscoveryFailed(String serviceType, int errorCode) {
                Log.e(TAG, "Stop discovery failed: " + errorCode);
                nsdManager.stopServiceDiscovery(this);
            }
        };

        nsdManager.discoverServices(SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener);
    }

    /**
     * Return the current list of discovered peer URIs.
     */
    public List<URI> getNearbyPeerUris() {
        return Collections.unmodifiableList(discoveredUris);
    }

    /**
     * Stop peer discovery if needed.
     */
    public void stopDiscovery() {
        if (discoveryListener != null) {
            try {
                nsdManager.stopServiceDiscovery(discoveryListener);
            } catch (IllegalArgumentException e) {
                Log.w(TAG, "Discovery already stopped or never started");
            }
        }
    }
}
