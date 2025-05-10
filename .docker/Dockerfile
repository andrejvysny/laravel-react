FROM php:8.3-fpm

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

RUN composer install --no-dev

EXPOSE 80


# TODO