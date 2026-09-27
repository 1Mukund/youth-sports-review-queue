#!/bin/bash
# Deploy the prototype. Usage: ./deploy.sh "commit message"
set -e
cd "$(dirname "$0")"
git add -A
git commit -q -m "${1:-Update prototype}" || echo "(nothing new to commit)"
git push -q origin master
echo "Pushed. Waiting for GitHub Pages to rebuild..."
sleep 10
until [ "$(curl -s -o /dev/null -w '%{http_code}' https://1mukund.github.io/youth-sports-review-queue/)" = "200" ]; do sleep 5; done
echo "LIVE: https://1mukund.github.io/youth-sports-review-queue/"
