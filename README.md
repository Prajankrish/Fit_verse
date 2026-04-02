# Style Fit Studio

A virtual fitting room application that allows users to create their avatar and try on different clothing items with customizable body measurements and skin tones.

## Features

- **Virtual Avatar Creation** - Create and customize your avatar with different body types
- **Gender Selection** - Choose between female, male, or non-binary avatars
- **Body Type Options** - Select from slim, average, athletic, muscular, petite, tall, or curvy body types
- **Skin Tone Customization** - Choose from multiple skin tones
- **Measurements** - Adjust height, bust, waist, and hips measurements
- **Virtual Try-On** - Browse and try on clothing items
- **Size Guide** - Reference size information for better fitting

## Technologies Used

- **Vite** - Fast frontend build tool
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Three.js & React Three Fiber** - 3D graphics for avatar visualization
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd style-fit-studio

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```sh
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint the code
npm lint
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── AppNavbar.tsx
│   ├── AvatarViewer.tsx
│   └── ClothingCard.tsx
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── assets/          # Static assets
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Development

This is a personal project designed to provide a unique virtual fitting room experience. You can customize and extend the application to add more features, clothing items, or avatar customization options.

## License

This project is personal and private.

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
