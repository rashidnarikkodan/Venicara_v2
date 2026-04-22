# Venicara | Luxury Fragrance Atelier

![Venicara Banner](/public/images/logo.avif)

Venicara is a production-grade, high-fidelity e-commerce platform dedicated to the world of luxury fragrances. Built with a focus on premium aesthetics and scalable architecture, it provides a seamless shopping experience for scent enthusiasts and a powerful management console for administrators.

---

## ✨ Features

### 🛍️ User Experience (Storefront)
- **Luxury Design System**: A unified, high-end visual identity using TailwindCSS with full Dark/Light mode synchronization.
- **Dynamic Catalog**: Advanced filtering and sorting of fragrances by family, price, and popularity.
- **Smart Cart & Wishlist**: Real-time state management for a frictionless purchase journey.
- **Venicara Wallet**: Integrated digital wallet with Razorpay top-ups and transaction history.
- **Premium Order Tracking**: Detailed tracking of olfactory acquisitions, including easy return requests and review systems.
- **Referral Program**: High-fidelity referral ecosystem to reward brand advocates.

### 🛡️ Administrative Ecosystem
- **Executive Dashboard**: Real-time KPI visualization (Sales, Orders, Revenue) powered by Chart.js.
- **Catalog Management**: Granular control over products, variants (size/volume), and categories with image processing.
- **Sales Intelligence**: Comprehensive reporting with PDF/Excel export capabilities.
- **Coupon Engine**: Robust promotional code system with validation and usage limits.
- **Customer Management**: Detailed CRM to manage user access and verification status.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js (Express.js) |
| **Database** | MongoDB (Mongoose ODM) |
| **Frontend** | EJS Templating, TailwindCSS |
| **Interactivity** | Vanilla JS (ES6+), AJAX (Fetch API) |
| **Authentication** | Passport.js / Session-based Auth |
| **Payments** | Razorpay Integration |
| **Storage** | Multer / Cloud-ready local storage |
| **Styling** | Custom Luxury Design Tokens (Gold-500, Luxury-Black) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB (Local instance or Atlas URI)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/venicara_v2.git
   cd venicara_v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_luxury_secret
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

4. **Build the Styles:**
   Compile the TailwindCSS production bundle:
   ```bash
   npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css
   ```

5. **Run the Application:**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

---

## 🌐 Deployment

The application is optimized for deployment behind an Nginx reverse proxy. A sample configuration is provided in `nginx/venicara.config`:

- **SSL**: Integrated with Let's Encrypt for secure HTTPS communication.
- **Static Assets**: Configured for high-performance direct serving via Nginx.
- **Uploads**: Tuned `client_max_body_size` for premium product image handling.

---

## 🎨 Design Principles
- **Aesthetic First**: Every UI element is designed to feel "expensive" and premium.
- **FOUC-Proof**: Immediate theme detection to prevent light-mode flashes on dark-mode preference.
- **Micro-animations**: Subtle transitions and hover effects to enhance user engagement.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Designed with elegance. Engineered for performance.*  
**Venicara | The Essence of Elegance**
