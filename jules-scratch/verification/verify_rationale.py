
import time
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the Rationale page
        page.goto("http://127.0.0.1:5000/rationale")

        # Input a thesis title - CORRECTED LABEL
        page.get_by_label("Enter your working thesis title:").fill("The Impact of AI on Modern Education")

        # Click the generate button
        page.get_by_role("button", name="Generate Rationale").click()

        # The result is now in a textarea, not a content-card
        # Let's wait for the textarea to be populated
        # We can check if its value is not empty.
        textarea = page.locator("#rationale-output")

        # Wait for the textarea to not be empty, with a generous timeout
        expect(textarea).not_to_have_value("", timeout=60000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/rationale_verification.png")

        print("Screenshot saved to jules-scratch/verification/rationale_verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Capture a screenshot even on failure for debugging
        page.screenshot(path="jules-scratch/verification/rationale_error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
