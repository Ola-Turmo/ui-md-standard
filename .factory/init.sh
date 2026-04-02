#!/bin/bash
set -e

cd /root/lovkode.no/ui-md-standard

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "UI.md standard improvements environment ready"
