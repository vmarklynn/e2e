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

    await request.post('http://localhost:3001/api/users', {
      data: {
        name: "Lizzie",
        username: "lizzie@gmail.com",
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
      await page.getByTestId('username').fill('vincent@gmail.com')
      await page.getByTestId('password').fill('12345678')


      await page.getByRole('button', { name: 'Login' }).click()
      await expect(page.getByText('Blogs')).toBeVisible()
    })

    test('fails with invalid credentials', async ({ page }) => {
      await page.getByTestId('username').fill('vincent@gmail.com')
      await page.getByTestId('password').fill('123')

      await page.getByRole('button', { name: 'Login' }).click()

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('Wrong credentials')

    })
  })

  describe('logged in users', () => {
    beforeEach(async ({ page }) => {

      await page.getByTestId('username').fill('vincent@gmail.com')
      await page.getByTestId('password').fill('12345678')
      await page.getByRole('button', { name: 'Login' }).click()
    })

    test('can succesfully create a post', async ({ page }) => {

      await page.getByRole('button', { name: 'New Note' }).click()

      await page.getByTestId('author').fill('test author')
      await page.getByTestId('title').fill('test post')
      await page.getByTestId('url').fill('test url')

      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(page.getByText('test post - test author')).toBeVisible()

    })

    test('can succesfully like a post', async ({ page }) => {

      await page.getByRole('button', { name: 'New Note' }).click()

      await page.getByTestId('author').fill('test author')
      await page.getByTestId('title').fill('test post')
      await page.getByTestId('url').fill('test url')

      await page.getByRole('button', { name: 'Submit' }).click()

      await page.getByRole('button', { name: 'View' }).click()
      await page.getByRole('button', { name: 'like' }).click()

      await expect(page.getByText('1')).toBeVisible()

    })

    test('can delete their blog', async ({ page }) => {

      await page.getByRole('button', { name: 'New Note' }).click()

      await page.getByTestId('author').fill('test author')
      await page.getByTestId('title').fill('test post')
      await page.getByTestId('url').fill('test url')

      await page.getByRole('button', { name: 'Submit' }).click()

      await page.getByRole('button', { name: 'View' }).click()

      page.on('dialog', async dialog => {
        expect(dialog.message()).toEqual('Remove test post by test author?')
        await dialog.accept()
      })

      await page.getByRole('button', { name: 'Remove' }).click()


      await expect(page.getByText('test post - test author')).not.toBeVisible()
    })

    test('cannot delete another user post', async ({ page }) => {
      await page.getByRole('button', { name: 'New Note' }).click()
      await page.getByTestId('author').fill('test author')
      await page.getByTestId('title').fill('test post')
      await page.getByTestId('url').fill('test url')
      await page.getByRole('button', { name: 'Submit' }).click()
      await page.getByRole('button', { name: 'Log out' }).click()


      await page.getByTestId('username').fill('lizzie@gmail.com')
      await page.getByTestId('password').fill('12345678')
      await page.getByRole('button', { name: 'Login' }).click()

      await page.getByRole('button', { name: 'View' }).click()

      await expect(page.getByText('Remove')).not.toBeVisible()
    })

    test('will view posts in like ascending order', async ({ page }) => {

      await page.getByRole('button', { name: 'New Note' }).click()
      await page.getByTestId('author').fill('test author')
      await page.getByTestId('title').fill('test post')
      await page.getByTestId('url').fill('test url')
      await page.getByRole('button', { name: 'Submit' }).click()
      await page.getByRole('button', { name: 'View' }).click()
      await page.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('test post - test author')).toBeVisible()
      await page.getByRole('button', { name: 'Hide' }).click()

      await page.getByRole('button', { name: 'New Note' }).click()
      await page.getByTestId('author').fill('second author')
      await page.getByTestId('title').fill('second test post')
      await page.getByTestId('url').fill('second url')
      await page.getByRole('button', { name: 'Submit' }).click()
      await expect(page.getByText('second test post - second author')).toBeVisible()
      await page.getByRole('button', { name: 'View' }).last().click()
      await expect(page.getByText('second url')).toBeVisible()
      await page.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('1')).toBeVisible()
      await page.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('2')).toBeVisible()
      await page.getByRole('button', { name: 'View' }).click()
      await expect(page.getByText('test url')).toBeVisible()
      await expect(page.getByTestId('likes').first()).toContainText('2')
    })
  })
})

