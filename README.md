# Spendly - Personal Finance Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)

Spendly is an open-source personal finance tracker that helps you manage your finances, analyze spending patterns, and maintain budgets. It integrates with GoCardless for seamless bank account imports and provides powerful financial analysis tools.

## 🌟 Features

- **Bank Account Integration**: Import transactions automatically using GoCardless
- **Financial Analysis**: Get insights into your spending patterns and financial health
- **Budget Management**: Create and track budgets for different categories
- **Transaction Categorization**: Automatically categorize transactions with machine learning
- **Reports & Visualizations**: Beautiful charts and reports for better financial understanding
- **Multi-currency Support**: Track finances in multiple currencies
- **Secure**: Bank-level security for your financial data

## 🚀 Tech Stack

- **Backend**: Laravel 10.x
- **Frontend**: React 18.x
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **API Integration**: GoCardless API
- **Testing**: PHPUnit, Jest

## 📋 Prerequisites

- PHP 8.1 or higher
- Node.js 16.x or higher
- Composer
- MySQL/PostgreSQL
- GoCardless API credentials

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spendly.git
cd spendly
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install JavaScript dependencies:
```bash
npm install
```

4. Copy the environment file:
```bash
cp .env.example .env
```

5. Configure your environment variables in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spendly
DB_USERNAME=root
DB_PASSWORD=

GOCARDLESS_ACCESS_TOKEN=your_access_token
GOCARDLESS_ENVIRONMENT=sandbox
```

6. Generate application key:
```bash
php artisan key:generate
```

7. Run migrations:
```bash
php artisan migrate
```

8. Start the development servers:
```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - React
npm run dev
```

## 🧪 Testing

Run the test suites:

```bash
# Backend tests
php artisan test

# Frontend tests
npm test
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Frontend Development Guide](docs/frontend.md)
- [Backend Development Guide](docs/backend.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Laravel](https://laravel.com)
- [React](https://reactjs.org)
- [GoCardless](https://gocardless.com)
- All our contributors and supporters

## 📞 Support

- [GitHub Issues](https://github.com/yourusername/spendly/issues)
- [Discord Community](https://discord.gg/spendly)
- [Documentation](https://docs.spendly.app)

## 🔗 Links

- [Website](https://spendly.app)
- [Blog](https://blog.spendly.app)
- [Twitter](https://twitter.com/spendly)
- [LinkedIn](https://linkedin.com/company/spendly)
