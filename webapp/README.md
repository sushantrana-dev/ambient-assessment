# Hierarchical Space Navigator

A React TypeScript application for managing camera streams in hierarchical spaces, built as a take-home interview project.

## Features

- **Site Selection**: Choose between different sites (San Jose, Toronto, Mars)
- **Hierarchical Space Navigation**: Tree structure displaying spaces and sub-spaces
- **Camera Stream Management**: Select/deselect individual camera streams
- **Bulk Selection**: Select all cameras in a space with three-state checkboxes
- **Selected Cameras List**: View and remove selected cameras with hover interactions
- **Expand/Collapse**: Navigate through complex nested space structures
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes with persistent preference
- **Modern UI**: Beautiful interface with smooth transitions and animations

## Tech Stack

- **React 18** with TypeScript
- **Custom Hooks** for API management and state
- **Context API** for theme management
- **CSS Custom Properties** for theming
- **Fetch API** for HTTP requests

## Project Structure

```
src/
├── components/
│   ├── SiteSelector.tsx          # Site dropdown selector
│   ├── ThemeToggle.tsx           # Theme toggle button
│   ├── SpaceTree/
│   │   ├── SpaceTree.tsx         # Main tree component
│   │   ├── SpaceNode.tsx         # Individual space node
│   │   ├── StreamItem.tsx        # Individual camera stream
│   │   └── index.ts
│   └── SelectedCameras/
│       ├── SelectedCamerasList.tsx # Selected cameras display
│       └── index.ts
├── contexts/
│   └── ThemeContext.tsx          # Theme management context
├── hooks/
│   └── useApi.ts                 # API management hooks
├── types/
│   └── api.types.ts              # TypeScript type definitions
├── utils/
│   └── treeUtils.ts              # Tree manipulation utilities
└── App.tsx                       # Main application component
```

## API Integration

The application integrates with the provided API endpoints:

- `GET /sites/` - Retrieve available sites (note: trailing slash required)
- `GET /spaces/?siteId={id}` - Retrieve spaces for a specific site (note: trailing slash required)

### Available Sites

1. **San Jose** (id: 1) - Flat structure for initial testing
2. **Toronto** (id: 2) - Complex nested hierarchy
3. **Mars** (id: 3) - Error handling test case

### API Response Format

```json
// Sites endpoint
{
  "sites": [
    {"id": 1, "name": "San Jose"},
    {"id": 2, "name": "Toronto"},
    {"id": 3, "name": "Mars"}
  ]
}

// Spaces endpoint - Note the nested structure
{
  "spaces": [
    {
      "spaces": [
        {
          "id": 2,
          "name": "Marketing",
          "streams": [
            {"id": 1, "name": "Marketing Camera 1"},
            {"id": 2, "name": "Marketing Camera 2"}
          ],
          "parentSpaceId": 1
        },
        {
          "id": 1,
          "name": "Main Building",
          "streams": [
            {"id": 3, "name": "Main Entrance"},
            {"id": 4, "name": "Reception Desk"}
          ],
          "parentSpaceId": null
        }
      ]
    },
    {
      "spaces": [
        {
          "id": 3,
          "name": "Corporate Office",
          "streams": [
            {"id": 7, "name": "Executive Suite"}
          ],
          "parentSpaceId": 8
        }
      ]
    }
  ]
}
```

## Key Features Implementation

### Theme System
- **Light/Dark Mode**: Toggle between themes with a beautiful switch
- **Persistent Preference**: Theme choice is saved to localStorage
- **Smooth Transitions**: All theme changes include smooth animations
- **CSS Custom Properties**: Efficient theme switching with CSS variables

### Tree Structure
- Converts flat space array into hierarchical tree
- Maintains parent-child relationships
- Supports unlimited nesting levels
- Handles nested API response structure

### Checkbox Logic
- **Unchecked**: No streams selected in space
- **Fully Selected**: All streams in space selected
- **Partially Selected**: Some but not all streams selected

### State Management
- Synchronized tree checkboxes with selected list
- Optimistic UI updates
- Proper error handling and loading states

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

## Development

- **TypeScript**: Strict typing throughout the application
- **ESLint**: Code quality and consistency
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Theme System**: CSS custom properties for efficient theming

## Usage

### Theme Toggle
- Click the theme toggle button (sun/moon icon) in the header
- Theme preference is automatically saved
- Smooth transitions between themes

### Site Selection
- Use the dropdown in the header to select different sites
- Each site has different space structures for testing

### Space Navigation
- Click the arrow (▶/▼) to expand/collapse spaces
- Use checkboxes to select individual streams or entire spaces
- Three-state checkboxes show selection status

### Selected Streams
- View selected cameras in the right panel
- Hover over items to see the remove button (×)
- Click the × to remove streams from selection

## Testing Scenarios

1. **Theme Toggle**: Switch between light and dark modes
2. **Site Selection**: Switch between different sites
3. **Individual Selection**: Select/deselect individual streams
4. **Bulk Selection**: Test space-level selection
5. **Nested Navigation**: Explore complex hierarchies
6. **State Persistence**: Verify expand/collapse states and theme preference
7. **Error Handling**: Test with Mars site (error case)

## Production Readiness

- ✅ No TODOs or placeholders
- ✅ Comprehensive error handling
- ✅ Loading states for all async operations
- ✅ Responsive design
- ✅ Accessibility features
- ✅ TypeScript strict mode
- ✅ Clean, maintainable code structure
- ✅ Dark/Light theme support with persistent preferences
- ✅ Correct API response handling
- ✅ Smooth animations and transitions
