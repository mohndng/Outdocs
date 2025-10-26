from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://127.0.0.1:5000/title")

    # Fill in the keywords
    page.get_by_label("Enter keywords (comma-separated):").fill("social media, youth mental health")

    # Click the generate button
    page.get_by_role("button", name="Generate Titles").click()

    # Wait for the response and check for the heading
    expect(page.get_by_role("heading", name="Suggested Titles:")).to_be_visible(timeout=20000)

    page.screenshot(path="jules-scratch/verification/title_verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
