const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: "Vincent",
        username: "vincent@gmail.com",
        password: "12345678"

      }
    })
    await page.goto('http://localhost:5173')

  })

  test('defaults to Login form', async ({ page }) => {
    await expect(page.getByText('Log In to Application')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with valid credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('vincent@gmail.com')
      await page.getByRole('textbox').last().fill('12345678')

      await page.getByText('Login').click()

      await expect(page.getByText('Blogs')).toBeVisible()
    })

    test('fails with invalid credentials', async ({ page }) => {
      await page.getByRole('textbox').first().fill('vincent@gmail.com')
      await page.getByRole('textbox').last().fill('1222')

      await page.getByText('Login').click()

      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('Wrong credentials')

    })

  })

})

