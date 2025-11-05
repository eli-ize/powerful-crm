# Frontend Testing Setup

## Install Testing Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/ui jsdom
```

## Run Tests
```bash
npm run test
```

## Test Files
- Place test files next to components: `Button.test.tsx`
- Or in `__tests__` folder: `__tests__/Button.test.tsx`

## Example Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Coming Soon
- Component tests for CRM features
- E2E tests with Playwright
- Visual regression tests
