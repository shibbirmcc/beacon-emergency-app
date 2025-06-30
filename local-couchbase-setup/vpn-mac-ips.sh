#!/bin/bash

echo "🔹 ZeroTier IP(s) (matching feth* interfaces):"
ifconfig | grep -A3 'feth' | grep 'inet ' | awk '{print $2}' || echo "  No ZeroTier (feth*) interface found."

echo ""
echo "🔹 Tailscale IP(s) (matching tailscale* interfaces):"
ifconfig | grep -A3 'tailscale' | grep 'inet ' | awk '{print $2}' || echo "  No Tailscale interface found."

echo ""
echo "🔹 Tailscale IP(s) via utun interface (if needed):"
ifconfig | grep -A3 'utun' | grep 'inet ' | awk '{print $2}' || echo "  No utun-based Tailscale interface found."
