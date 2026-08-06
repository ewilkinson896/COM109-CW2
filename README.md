# COM109-CW2 - York Street Coffee

Coursework repository for COM109 Client Side Development.

Link to repo: https://github.com/ewilkinson896/COM109-CW2

This project is a multi-page coffee shop website built with HTML, CSS, and JavaScript (plus jQuery on selected pages). It includes a product browsing experience, a subscription builder, a cart/checkout flow, and accessibility-focused UI touches such as a skip link and keyboard-friendly interactions.

## Project Overview

York Street Coffee is a fictional Belfast cafe website designed to demonstrate client-side web development skills:

- Semantic page structure and shared styling
- Dynamic page behavior with JavaScript
- Session-based cart management via `sessionStorage`
- Form validation and user feedback
- Basic accessibility patterns (skip links, keyboard support, ARIA attributes)

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- jQuery (used on `product`, `subscription`, and `cart` pages)

## Roles

Erin Wilkinson - subscription page and functionality

Emma Grier - cart page functionality

Tom Wilkinson - main page and information page and functionality

Joshua Nicholson - logo, product page and functionality and information page and functionality

## Repository Structure

- `index.html`: Home page
- `pages/`: Secondary pages
  - `product.html`: Product listing, filtering, search, details modal, add to cart
  - `subscription.html`: Subscription builder with summary and carousel
  - `cart.html`: Cart management and checkout form
  - `information.html`: About/business information page
- `scripts/`: Page-specific JavaScript
  - `index.js`: Shop open/closed status and back-to-top action
  - `product.js`: Product rendering, filtering/search, modal behavior, cart updates
  - `subscription.js`: Subscription form state, draft restore, pricing summary, cart integration
  - `cart.js`: Cart rendering, quantity controls, checkout validation and confirmation
  - `information.js`: Back-to-top action
- `styles/style.css`: Shared site styling
- `images/`: Site and product images
- `lighthouse/`: Saved Lighthouse JSON reports (`old/` and `current/`)
- `lighthouse-scores.txt`: Current Lighthouse score summary
- `lighthouse-scores-old.txt`: Previous Lighthouse score summary

## Main Features

- Home page with hero section, featured products, and opening-hours status message
- Product page with:
  - Category filtering (`All`, `Coffee`, `Bakery`)
  - Keyword search
  - Product details modal with keyboard support (`Escape`, focus trap)
  - Add-to-cart actions stored in `sessionStorage`
- Subscription page with:
  - Customer details capture
  - Dynamic coffee item builder (coffee/roast/grind)
  - Optional bakery add-ons and gift option
  - Live summary and pricing calculation
  - Draft persistence/restoration in `sessionStorage`
  - Carousel UI for subscription highlights
- Cart page with:
  - Quantity increase/decrease and item removal
  - Subtotal/total summary
  - Checkout validation (required fields, email, card number, expiry, CVV)
  - Order confirmation state and cart reset

## Running Locally

Because this is a static front-end site, run it from a local web server (recommended for correct asset and script loading):

```bash
cd /Users/erinwilkinson/COM109-CW2
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`

## Notes

- Cart and subscription draft data are stored per browser session using `sessionStorage`.
- Lighthouse output files are included for comparison between old and current results.
