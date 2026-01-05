#!/bin/sh

cd frontend
npm run build
rm -rvf ../backend/public
mv out ../backend/public
cd ../backend
bunx wrangler deploy
