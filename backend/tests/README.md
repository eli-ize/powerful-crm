# Complete Testing Guide for Powerful CRM

## 🎯 Testing Philosophy

This project uses a **practical, real-world testing approach**:
- **Unit Tests**: Test individual functions (like phone formatters)
- **Integration Tests**: Test API endpoints with real HTTP requests
- **Manual Testing**: Test actual Telnyx calls and database operations

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## 📁 Test Structure

```
tests/
├── setup.ts              # Test configuration
├── health.test.ts        # Health endpoint tests
├── telnyx.test.ts        # Telnyx service unit tests
└── calls.test.ts         # Call API integration tests (to be added)
```

## ✅ What We Test

### 1. **Health Endpoints** (`tests/health.test.ts`)
- API is running and responds
- Returns correct status codes
- Response has required fields
- Timestamps are valid

### 2. **Telnyx Service** (`tests/telnyx.test.ts`)
- Phone number formatting (adds + prefix)
- Phone number validation (E.164 format)
- Edge cases (empty strings, invalid formats)

### 3. **Integration Tests** (Coming soon)
- Database connections
- Call creation
- Webhook handling

## 📝 Writing Your First Test

### Example: Test a Simple Function

```typescript
// In src/utils/formatters.ts
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// In tests/formatters.test.ts
import { formatCurrency } from '../src/utils/formatters';

describe('formatCurrency', () => {
  it('should format number as currency', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('should round to 2 decimals', () => {
    expect(formatCurrency(99.999)).toBe('$100.00');
  });
});
```

### Example: Test an API Endpoint

```typescript
import request from 'supertest';
import app from '../src/server';

describe('POST /api/contacts', () => {
  it('should create a new contact', async () => {
    const newContact = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+15551234567'
    };

    const response = await request(app)
      .post('/api/contacts')
      .send(newContact)
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('John Doe');
  });
});
```

## 🎓 Testing Best Practices

### 1. **Test Naming**
```typescript
// ❌ Bad
it('works', () => {});

// ✅ Good
it('should return 404 when contact not found', () => {});
```

### 2. **Arrange-Act-Assert Pattern**
```typescript
it('should calculate total price', () => {
  // Arrange: Set up test data
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act: Execute the function
  const total = calculateTotal(items);
  
  // Assert: Verify the result
  expect(total).toBe(30);
});
```

### 3. **Test One Thing at a Time**
```typescript
// ❌ Bad: Tests multiple things
it('should create user and send email', () => {
  const user = createUser('test@test.com');
  expect(user).toBeDefined();
  expect(emailSent).toBe(true);
});

// ✅ Good: Separate tests
it('should create user', () => {
  const user = createUser('test@test.com');
  expect(user).toBeDefined();
});

it('should send welcome email', () => {
  createUser('test@test.com');
  expect(emailSent).toBe(true);
});
```

## 🔧 Test Tools Explained

### Jest
- Test runner and assertion library
- Comes with built-in mocking
- `describe()` groups tests together
- `it()` or `test()` defines a single test
- `expect()` makes assertions

### Supertest
- Tests HTTP endpoints without starting server
- Makes real requests to Express app
- Handles async/await naturally

### Coverage
- Shows which code is tested
- Goal: 70%+ coverage for critical code
- Don't chase 100% - focus on important code

## 🐛 Debugging Tests

### Run a Single Test File
```bash
npm test health.test.ts
```

### Run Tests Matching a Pattern
```bash
npm test -- --testNamePattern="phone number"
```

### See More Details
```bash
npm test -- --verbose
```

## 📊 Understanding Test Output

```
PASS  tests/health.test.ts
  Health Endpoints
    GET /api/health
      ✓ should return 200 and health status (45ms)
      ✓ should return current timestamp (12ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Time:        2.5s
```

- **✓** = Test passed
- **✗** = Test failed
- **(45ms)** = How long test took
- **Coverage** = % of code tested

## 🎯 Next Steps

1. **Run existing tests**: `npm test`
2. **Add test for your feature**:
   - Create file: `tests/myFeature.test.ts`
   - Write tests following examples above
   - Run: `npm test myFeature.test.ts`
3. **Check coverage**: `npm run test:coverage`
4. **Keep tests simple**: Test what matters, not everything

## 💡 Common Test Scenarios

### Test Error Handling
```typescript
it('should return 400 for invalid phone', async () => {
  await request(app)
    .post('/api/calls')
    .send({ to: 'invalid', from: '+15551234567' })
    .expect(400);
});
```

### Test Authentication
```typescript
it('should require authentication', async () => {
  await request(app)
    .get('/api/contacts')
    .expect(401);
});

it('should allow access with token', async () => {
  const token = 'valid-jwt-token';
  await request(app)
    .get('/api/contacts')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```

### Test Database Operations
```typescript
it('should save contact to database', async () => {
  const contact = await createContact({
    name: 'Test',
    email: 'test@test.com'
  });
  
  const found = await prisma.contact.findUnique({
    where: { id: contact.id }
  });
  
  expect(found).toBeDefined();
  expect(found?.name).toBe('Test');
});
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest#readme)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Remember**: Good tests are like good documentation - they show how code should work!
