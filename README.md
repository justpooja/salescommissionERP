# SalesFlow ERP

A full-stack Sales & Commission ERP system built with React, Django REST Framework, and PostgreSQL.

## Features

- User authentication with session-based login
- Admin and Staff role-based access control
- Customer management
- Product management
- Sales management
- Automatic sales total calculation
- Automatic 10% commission calculation
- Salesperson assignment
- Commission dashboard
- Sales reports
- Date-based filtering
- Admin and Staff-specific data access
- REST API integration
- PostgreSQL database
- Automated Django tests

## Tech Stack

### Frontend
- React.js
- JavaScript
- Axios
- HTML
- CSS

### Backend
- Python
- Django
- Django REST Framework

### Database
- PostgreSQL

### Development Tools
- Git
- GitHub
- Visual Studio Code

## User Roles

### Admin
- View all sales
- Manage customers
- Manage products
- View commission summaries
- View reports
- Assign salespeople to sales

### Staff
- View their own sales
- Create sales
- Edit their own sales
- Delete their own sales
- View their own commission
- View reports for their sales

## Project Structure

```text
salescommissionERP/
├── accounts/
├── backend/
├── frontend/
├── sales/
├── manage.py
├── package.json
├── package-lock.json
├── .gitignore
└── README.md