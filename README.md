# Accounting App

A simple accounting expense/receipt capture form built with React.

## Run locally (with npm)
```bash
npm install
npm start
```

## Run locally (without npm)
- docker build -t accounting-app .
- docker run -p 3000:80 accounting-app

- Access the app with http://localhost:3000/

## Features
- Responsive design
- Validation for required fields
- Local draft saving (localStorage)
- Upload/preview receipts
- Save + Submit with toast notifications
