import { Locator, Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { logger } from '../utils/logger';
import { PageElement } from '../types';

export class OTTSettingsPage {
    private readonly page: Page;
    private readonly pageUtils: PageUtils;
    private readonly accountIcon: PageElement;
    private readonly accountAndSettingsLink: PageElement;
    private readonly parentalControlsSection: PageElement;
    private readonly parentalPinToggle: PageElement;
    private readonly parentalPinPasswordField: PageElement;
    private readonly passwordSubmitButton: PageElement;
    private readonly parentalPinSetupMessage: PageElement;
    private readonly passwordVisibilityToggle: PageElement;
    private readonly parentalPinErrorMessage: PageElement;
    private readonly parentalPinInputs: PageElement;
    private readonly parentalPinSaveButton: PageElement;
    private readonly parentalPinSuccessHeader: PageElement;
    private readonly parentalPinSuccessDetails: PageElement;
    private readonly parentalPinSuccessContinueButton: PageElement;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.accountIcon = { selector: 'img[alt="account"]' };
        this.accountAndSettingsLink = { selector: 'text=Account & Settings' };
        this.parentalControlsSection = { selector: '#parentalControls' };
        this.parentalPinToggle = { selector: '#parentalControls >> button.relative.rounded-full.w-12.h-6' };
        this.parentalPinPasswordField = { selector: '//input[@id="login-password-input"]'};
        this.passwordSubmitButton = { selector: 'role=button[name="Submit"]' };
        this.parentalPinSetupMessage = { selector: 'role=heading[name="Set an account owner PIN"]' };
        this.passwordVisibilityToggle = { selector: 'role=button[name="Toggle Password Visibility"]' };
        this.parentalPinErrorMessage = { selector: 'text=Invalid credentials. Please try again.' };
        this.parentalPinInputs = { selector: '.flex.flex-wrap.gap-2 input' };
        this.parentalPinSaveButton = { selector: 'role=button[name="Save"]' };
        this.parentalPinSuccessHeader = { selector: '//h1[text()="Parental Controls Updated"]' };
        this.parentalPinSuccessDetails = { selector: 'text=Your changes to the parental controls have been saved successfully.' };
        this.parentalPinSuccessContinueButton = { selector: 'role=button[name="Continue Button"]' };
    }

    async clickAccountIcon(): Promise<void> {
        logger.elementInteraction('click', 'Account icon');
        await this.pageUtils.safeClick(this.accountIcon);
    }

    async clickAccountAndSettings(): Promise<void> {
        logger.elementInteraction('click', 'Account and Settings');
        await this.pageUtils.safeClick(this.accountAndSettingsLink);
    }

    async scrollToParentalControlsSection(): Promise<void> {
        await this.page.locator(this.parentalControlsSection.selector).first().scrollIntoViewIfNeeded().catch(() => undefined);
    }

    async isParentalControlsSectionVisible(): Promise<boolean> {
        return await this.page.locator(this.parentalControlsSection.selector).first().isVisible().catch(() => false);
    }

    private async getParentalPinToggleState(): Promise<'on' | 'off' | 'unknown'> {
        try {
            const sectionLocator = this.page.locator(`${this.parentalControlsSection.selector} >> div.flex.items-center.space-x-2`).first();
            const labelText = await sectionLocator.locator('span').first().textContent({ timeout: 2000 });
            if (labelText) {
                const normalizedLabel = labelText.trim().toLowerCase();
                if (normalizedLabel === 'on') return 'on';
                if (normalizedLabel === 'off') return 'off';
            }
            const thumbClass = await sectionLocator.locator('button > span').first().getAttribute('class').catch(() => '');
            if (thumbClass?.includes('translate-x-full')) {
                return 'on';
            }
            if (thumbClass) {
                return 'off';
            }
        } catch {
            // Fallback to unknown when the toggle markup is not available.
        }
        return 'unknown';
    }

    async isParentalPinToggleOn(): Promise<boolean> {
        const state = await this.getParentalPinToggleState();
        return state === 'on';
    }

    async isParentalPinToggleOff(): Promise<boolean> {
        const state = await this.getParentalPinToggleState();
        return state === 'off';
    }

    async isParentalPinToggleDisabled(): Promise<boolean> {
        return await this.isParentalPinToggleOff();
    }

    async clickParentalPinToggle(): Promise<void> {
    logger.elementInteraction('click', 'Parental PIN toggle');
    await this.page.locator(this.parentalPinToggle.selector).first().waitFor({state: 'visible',timeout: 20000});
    await this.page.waitForTimeout(500);
    await this.pageUtils.safeClick(this.parentalPinToggle);
}

    async isParentalPinPasswordFieldVisible(): Promise<boolean> {
    try {
        await this.page.locator(this.parentalPinPasswordField.selector).first().waitFor({state: 'visible',timeout: 20000});
        return true;
    } catch {
        return false;
    }
}

    async enterParentalPinPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'Parental PIN password field');
        await this.pageUtils.safeType(this.parentalPinPasswordField, password);
    }

    async clickParentalPinSubmitButton(): Promise<void> {
    logger.elementInteraction('click', 'Parental PIN submit button');
    const submitButton = this.page.locator(this.passwordSubmitButton.selector).first();
    await submitButton.waitFor({ state: 'visible', timeout: 20000 });
    await submitButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await this.pageUtils.safeClick(this.passwordSubmitButton);
}

    async getParentalPinSetupMessage(): Promise<string> {
        try {
            const text = await this.page.locator(this.parentalPinSetupMessage.selector).first().textContent({ timeout: 1000 });
            return text?.trim() || '';
        } catch {
            return '';
        }
    }

    async isParentalPinSetupMessageVisible(): Promise<boolean> {
        return await this.page.locator(this.parentalPinSetupMessage.selector).first().isVisible().catch(() => false);
    }

    async waitForParentalPinSetupMessageVisible(timeout = 5000): Promise<boolean> {
        try {
            await this.page.locator(this.parentalPinSetupMessage.selector).first().waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    async isPasswordVisibilityIconVisible(): Promise<boolean> {
        return await this.page.locator(this.passwordVisibilityToggle.selector).first().isVisible().catch(() => false);
    }

    async togglePasswordVisibility(): Promise<void> {
        logger.elementInteraction('click', 'Password visibility toggle icon');
        await this.pageUtils.safeClick(this.passwordVisibilityToggle);
    }

    async getPasswordInputType(): Promise<string> {
        try {
            const type = await this.page.locator(this.parentalPinPasswordField.selector).first().getAttribute('type', { timeout: 1000 });
            return type?.trim() || 'password';
        } catch {
            return 'password';
        }
    }

    async isPasswordInputValueVisible(): Promise<boolean> {
        const inputType = await this.getPasswordInputType();
        return inputType === 'text';
    }

    async getPasswordInputValue(): Promise<string> {
        try {
            const value = await this.page.locator(this.parentalPinPasswordField.selector).first().inputValue({ timeout: 1000 });
            return value?.trim() || '';
        } catch {
            return '';
        }
    }

    async isParentalPinErrorMessageVisible(): Promise<boolean> {
        return await this.page.locator(this.parentalPinErrorMessage.selector).first().isVisible().catch(() => false);
    }

    async getParentalPinErrorMessage(): Promise<string> {
        try {
            const text = await this.page.locator(this.parentalPinErrorMessage.selector).first().textContent({ timeout: 1000 });
            return text?.trim() || '';
        } catch {
            return '';
        }
    }

    async waitForParentalPinErrorMessageVisible(timeout = 5000): Promise<boolean> {
        try {
            await this.page.locator(this.parentalPinErrorMessage.selector).first().waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    async areParentalPinInputsVisible(): Promise<boolean> {
        try {
            await this.page.waitForTimeout(15000);
            const inputs = this.page.locator(this.parentalPinInputs.selector);
            const firstVisible = await inputs.first().isVisible().catch(() => false);
            const count = await inputs.count();
            return count >= 4 && firstVisible;
        } catch {
            return false;
        }
    }

    async getParentalPinInputCount(): Promise<number> {
        return await this.page.locator(this.parentalPinInputs.selector).count().catch(() => 0);
    }

    async enterParentalPinDigits(pin: string): Promise<void> {
        const digits = (pin || '').split('');
        const inputs = this.page.locator(this.parentalPinInputs.selector);
        await inputs.first().click();
        for (let i = 0; i < digits.length; i++) {
            try {
                await inputs.nth(i).fill(digits[i]);
            } catch {
                // ignore individual failures
            }
        }
    }

    async areParentalPinInputsNumericOnlyTest(): Promise<boolean> {
        try {
            const inputs = this.page.locator(this.parentalPinInputs.selector);
            const count = await inputs.count();
            if (count < 4) {
                return false;
            }
            for (let i = 0; i < 4; i++) {
                const input = inputs.nth(i);
                await input.click();
                await input.fill('');
                // Letter input should not be accepted
                await input.type('a');
                const letterValue = await input.inputValue().catch(() => '');
                if (letterValue !== '') {
                    return false;
                }
                await input.fill('');
                // Numeric input should be accepted
                await input.type('1');
                const numericValue = await input.getAttribute('pattern').catch(() => '');
                if (numericValue != '[0-9]*•') {
                    return false;
                }
                await input.fill('');
            }
            return true;
        } catch {
            return false;
        }
    }

    async clickParentalPinSaveButton(): Promise<void> {
        logger.elementInteraction('click', 'Parental PIN save button');
        await this.pageUtils.safeClick(this.parentalPinSaveButton);
    }

    async getParentalPinSuccessMessage(): Promise<string> {
        try {
            const text = await this.page.locator(this.parentalPinSuccessHeader.selector).first().textContent({ timeout: 1000 });
            return text?.trim() || '';
        } catch {
            return '';
        }
    }

    async waitForParentalPinSuccessMessageVisible(timeout = 5000): Promise<boolean> {
        try {
            await this.page.locator(this.parentalPinSuccessHeader.selector).first().waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    async isParentalPinSuccessHeaderVisible(): Promise<boolean> {
        return await this.page.locator(this.parentalPinSuccessHeader.selector).first().isVisible().catch(() => false);
    }

    async getParentalPinSuccessHeader(): Promise<string> {
        try {
            const text = await this.page.locator(this.parentalPinSuccessHeader.selector).first().textContent({ timeout: 1000 });
            return text?.trim() || '';
        } catch {
            return '';
        }
    }

    async getParentalPinSuccessDetails(): Promise<string> {
        try {
            const text = await this.page.locator(this.parentalPinSuccessDetails.selector).first().textContent({ timeout: 1000 });
            return text?.trim() || '';
        } catch {
            return '';
        }
    }

    async isParentalPinSuccessContinueButtonVisible(): Promise<boolean> {
        return await this.page.locator(this.parentalPinSuccessContinueButton.selector).first().isVisible().catch(() => false);
    }

    async clickParentalPinSuccessContinueButton(): Promise<void> {
        logger.elementInteraction('click', 'Parental PIN success Continue button');
        await this.pageUtils.safeClick(this.parentalPinSuccessContinueButton);
    }
}
