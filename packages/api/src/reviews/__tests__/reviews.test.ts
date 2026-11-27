import test from 'node:test';
import assert from 'node:assert';
import {
  getProviderReviews,
  calculateReviewSummary,
  submitProviderReview,
  MOCK_REVIEWS,
} from '../index.ts';

test('REV-1: Reviews & Ratings Core Functions - retrieves mock reviews for a provider', async () => {
  const providerId = '20000000-0000-0000-0000-000000000002'; // Dhanmondi Care Pet Clinic
  const reviews = await getProviderReviews(providerId);
  assert.ok(reviews.length > 0, 'Should return reviews');
  assert.strictEqual(reviews[0].providerId, providerId);
  assert.ok(reviews[0].rating >= 1 && reviews[0].rating <= 5, 'Rating must be between 1 and 5');
  assert.strictEqual(reviews[0].isVerifiedVisit, true);
});

test('REV-1: Reviews & Ratings Core Functions - calculates average rating and star breakdown accurately', () => {
  const sampleReviews: any[] = [
    { id: '1', bookingId: 'b1', authorId: 'a1', authorName: 'User 1', providerId: 'p1', rating: 5, isVerifiedVisit: true, createdAt: '' },
    { id: '2', bookingId: 'b2', authorId: 'a2', authorName: 'User 2', providerId: 'p1', rating: 5, isVerifiedVisit: true, createdAt: '' },
    { id: '3', bookingId: 'b3', authorId: 'a3', authorName: 'User 3', providerId: 'p1', rating: 4, isVerifiedVisit: true, createdAt: '' },
    { id: '4', bookingId: 'b4', authorId: 'a4', authorName: 'User 4', providerId: 'p1', rating: 2, isVerifiedVisit: true, createdAt: '' },
  ];

  const summary = calculateReviewSummary(sampleReviews);
  assert.strictEqual(summary.ratingCount, 4);
  // (5 + 5 + 4 + 2) / 4 = 16 / 4 = 4.0
  assert.strictEqual(summary.ratingAvg, 4.0);
  assert.strictEqual(summary.breakdown[5], 2);
  assert.strictEqual(summary.breakdown[4], 1);
  assert.strictEqual(summary.breakdown[2], 1);
  assert.strictEqual(summary.breakdown[1], 0);
});

test('REV-1: Reviews & Ratings Core Functions - submits a new provider review and adds it to the provider list', async () => {
  const providerId = '20000000-0000-0000-0000-000000000002';
  const newReview = await submitProviderReview(
    {
      bookingId: '33333333-0000-0000-0000-000000000001',
      providerId,
      rating: 5,
      comment: 'অসাধারণ সেবা এবং চমৎকার ডাক্তার!',
    },
    {
      id: 'user-test-123',
      name: 'Test Reviewer',
    }
  );

  assert.ok(newReview.id, 'New review must have an id');
  assert.strictEqual(newReview.rating, 5);
  assert.strictEqual(newReview.authorName, 'Test Reviewer');
  assert.strictEqual(newReview.isVerifiedVisit, true);

  const updatedReviews = await getProviderReviews(providerId);
  assert.strictEqual(updatedReviews[0].id, newReview.id);
});
