# Spear Line: static site, enquiry API and health check in one small Node image. No dependencies to install.
FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY public ./public
COPY scripts/site-manifest.mjs scripts/purge-enquiries.mjs ./scripts/
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATA_DIR=/data
# Enquiries are written here, outside public/. Mount a persistent private volume at /data.
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=4s --start-period=10s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node","server.mjs"]
