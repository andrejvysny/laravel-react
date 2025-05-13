FROM php:8.3-fpm AS development

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-gnutls-dev \
    libonig-dev \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libxml2-dev \
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_pgsql pgsql zip intl

COPY . /var/www
WORKDIR /var/www
RUN composer install

EXPOSE 80

# Node build stage for frontend assets
FROM node:20-alpine AS node-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM php:8.3-apache AS production

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV PHP_OPCACHE_ENABLE=1
ENV PHP_OPCACHE_MEMORY_CONSUMPTION=128
ENV PHP_OPCACHE_INTERNED_STRINGS_BUFFER=8
ENV PHP_OPCACHE_MAX_ACCELERATED_FILES=4000
ENV PHP_OPCACHE_REVALIDATE_FREQ=60
ENV PHP_OPCACHE_FAST_SHUTDOWN=1

# Configure Apache
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf \
    && a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-gnutls-dev \
    libonig-dev \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libxml2-dev \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo \
    pdo_pgsql \
    pgsql \
    zip \
    intl \
    opcache \
    bcmath \
    exif \
    pcntl \
    soap

# Configure PHP for production
COPY .docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY .docker/php/php.ini /usr/local/etc/php/conf.d/php.ini

WORKDIR /var/www/html

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-plugins --no-progress --no-scripts --optimize-autoloader

# Copy application files
COPY . .
COPY --from=node-build /app/public/build ./public/build

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Switch to non-root user
USER www-data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80
