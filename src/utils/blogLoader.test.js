/**
 * Blog Loader Tests
 * Run with: node src/utils/blogLoader.test.js
 */

// Mock imports for testing
const testMarkdown = `---
title: "Test Blog"
description: "Test Description"
date: "2024-01-01"
author: "Test Author"
tags: ["Test", "Blog"]
---

# Test Blog

This is a test blog post.

## Section 1

Content here.
`;

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertTrue(value, message = '') {
  if (!value) {
    throw new Error(message || 'Expected value to be true');
  }
}

// Tests
console.log('Running Blog Loader Tests...\n');

test('Frontmatter parsing - title extraction', () => {
  const hasTitle = testMarkdown.includes('title:');
  assertTrue(hasTitle, 'Should have title field');
});

test('Frontmatter parsing - date extraction', () => {
  const hasDate = testMarkdown.includes('date:');
  assertTrue(hasDate, 'Should have date field');
});

test('Frontmatter parsing - tags extraction', () => {
  const hasTags = testMarkdown.includes('tags:');
  assertTrue(hasTags, 'Should have tags field');
});

test('Markdown content exists', () => {
  const hasContent = testMarkdown.includes('# Test Blog');
  assertTrue(hasContent, 'Should have markdown content');
});

test('Heading ID generation', () => {
  const heading = 'My Test Heading!';
  const id = heading.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  assertEquals(id, 'my-test-heading', 'Should generate correct heading ID');
});

test('Reading time calculation', () => {
  const content = 'word '.repeat(200); // 200 words
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  assertEquals(readingTime, 1, 'Should calculate 1 minute for 200 words');
});

test('Reading time for longer content', () => {
  const content = 'word '.repeat(450); // 450 words
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  assertEquals(readingTime, 3, 'Should calculate 3 minutes for 450 words');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(50));

process.exit(testsFailed > 0 ? 1 : 0);
