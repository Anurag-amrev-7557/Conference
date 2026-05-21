FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# API/DB unavailable during image build — skip prerender here; run in CI or post-publish (SEO-03).
ARG PRERENDER_SKIP=1
ENV PRERENDER_SKIP=${PRERENDER_SKIP}
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]