### 💰 Spender - Smart Expense Tracking App

A modern, intuitive mobile expense tracking application built with **React Native + Expo**, designed to help users track, analyze, and optimize their spending habits through an engaging swipe-based interface.

---

### ✨ Features

- 📱 **Cross-Platform** - Works on iOS and Android
- 👆 **Swipe-Based Interface** - Tinder-like card swiping to categorize expenses as "worth" or "waste"
- 📊 **Smart Insights** - Weekly spending analysis with personalized insights
- 🎯 **Expense Categories** - Food, Shopping, Transport, Coffee, Groceries, Delivery, Movies, Gas, and more
- 📈 **Visual Analytics** - Interactive charts and graphs for spending patterns
- 🏆 **Achievements System** - Gamified experience with spending milestones
- 🔐 **Secure Authentication** - Phone-based login with *fake* OTP verification (123456)
- 👤 **User Profiles** - Customizable profiles with avatar support
- 📝 **Expense Management** - Add, edit, and delete expenses with notes
- 💳 **Payment Methods** - Track different payment types
- 📅 **Date Tracking** - Organize expenses by date with weekly/monthly views
- 🔍 **Spending Patterns** - AI-powered pattern recognition and recommendations
- 📱 **Offline Support** - Works seamlessly with Firebase backend

---

### 🛠️ Tech Stack

#### 🔧 Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing system
- **React Navigation** - Navigation library

#### 🎨 UI/UX Libraries
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch interactions
- **React Native Skia** - High-performance graphics
- **React Native Gifted Charts** - Data visualization
- **Victory Native** - Chart components

#### 🔥 Backend & Services
- **Firebase** - Firestore database, and cloud services

#### 📦 Additional Tools
- **Expo Image Picker** - Profile photo selection
- **Expo Haptics** - Tactile feedback
- **React Native Deck Swiper** - Card swipe functionality
- **Bcryptjs** - Password hashing

---

### 📸 Screenshots

<p align="center">
  <img src="assets/screenshots/screenshot (1).jpg" width="250"/>
   <img src="assets/screenshots/screenshot (2).jpg" width="250"/>
   <img src="assets/screenshots/screenshot (3).jpg" width="250"/>
   <img src="assets/screenshots/screenshot (4).jpg" width="250"/>
   <img src="assets/screenshots/screenshot (5).jpg" width="250"/>
</p>



---

### ⚙️ Installation & Running Locally

#### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)

#### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Matan1Ohayon/Spender-App.git
cd spender
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add your Firebase configuration to `firebase.js`
   - Enable Phone Authentication in Firebase Console
   - Set up Firestore database

4. **Run the development server:**
```bash
npm start
```

5. **Run on specific platform:**
```bash
# iOS
npm run ios

# Android
npm run android

```

#### Build for Production

```bash
# Build with EAS (Expo Application Services)
eas build --platform ios
eas build --platform android
```

---

### 🚀 Deployment

This app is configured for deployment using **Expo Application Services (EAS)**.

- **EAS Build** - For building production apps
- **EAS Update** - For over-the-air updates
- **Project ID**: `e3a12fd3-502a-4fc2-8b29-47468781c59b`

To deploy updates:
```bash
eas update --branch production
```

---

### 📱 App Structure

```
spender/
├── app/                  # Expo Router pages
│   ├── screens/          # Main app screens
│   │   ├── auth/         # Authentication screens
│   │   └── home/         # Home, Profile, Insights, History
│   └── _layout.tsx       # Root layout
├── components/           # Reusable components
│   ├── insights/         # Analytics components
│   └── ...
├── contexts/             # React contexts
├── logic/                # Business logic engines
│   ├── insightEngine.ts
│   ├── achievementsEngine.ts
│   └── patternEngine.ts
├── firebase.js           # Firebase configuration
└── utils/                # Utility functions
```

---

### 🎯 Key Features Explained

#### Swipe-Based Categorization
Users swipe expenses left (waste) or right (worth) to quickly categorize spending, making expense tracking fast and intuitive.

#### Weekly Insights
The app generates personalized insights based on spending patterns, helping users understand their financial habits.

#### Achievements System
Gamified milestones encourage better spending habits:
- Zero Waste Day
- Clean Streak (3+ days)
- Weekly/Monthly Reductions
- Category Savings
- And more...

#### Visual Analytics
Interactive charts show:
- Spending trends over time
- Category breakdowns
- Weekly/monthly comparisons
- Progress tracking

---

### 📝 License

This project is private.

---

### 📬 Contact
- 🌐 Portfolio: https://matans-portfolio.vercel.app/ 
- 💼 LinkedIn: www.linkedin.com/in/matan-ohayon-4101b6276
- 📧 Email: matan1ohayon@gmail.com  
