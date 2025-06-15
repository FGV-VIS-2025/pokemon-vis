/**
 * Gerenciador central de estado para os screens
 * Coordena a navegação e atualização automática entre region, location e pokemon screens
 */

import { getLocationIdByName, getRegionIdByName } from "./dataManager.js";
import { createLocationScreen } from "./locationScreen.js";
import { createPokemonScreen, editPokemonsCard } from "./pokemonScreen.js";
import { createRegionScreen } from "./regionScreen.js";

class ScreenStateManager {
    constructor() {
        this.currentScreen = null;
        this.isUpdating = false;
        this.updateQueue = [];

        this.regionDisplay = document.getElementsByClassName("region-screen")[0];
        this.locationDisplay = document.getElementsByClassName("location-screen")[0];
        this.contentContainer = document.getElementsByClassName("content-container")[0];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupObservers();
    }

    setupEventListeners() {
        document.addEventListener('regionChanged', async (event) => {
            const { regionName, source } = event.detail;

            if (this.currentScreen === 'region') {
                await this.updateRegionScreen(regionName);
            }
        });

        document.addEventListener('locationChanged', async (event) => {
            const { locationName, source } = event.detail;

            if (this.currentScreen === 'location') {
                await this.updateLocationScreen(locationName);
            }
        });

        // Listener para quando um screen é ativado
        document.addEventListener('screenActivated', (event) => {
            const { screenType } = event.detail;
            this.currentScreen = screenType;
        });
    }

    setupObservers() {
        // Observer para mudanças no texto da região
        const regionObserver = new MutationObserver((mutations) => {
            if (this.isUpdating) return;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const regionName = this.regionDisplay.textContent.trim();
                    this.dispatchCustomEvent('regionChanged', {
                        regionName,
                        source: 'mutation_observer'
                    });
                    break;
                }
            }
        });

        // Observer para mudanças no texto da localização
        const locationObserver = new MutationObserver((mutations) => {
            if (this.isUpdating) return;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const locationName = this.locationDisplay.textContent.trim();
                    this.dispatchCustomEvent('locationChanged', {
                        locationName,
                        source: 'mutation_observer'
                    });
                    break;
                }
            }
        });

        // Ativar observers
        regionObserver.observe(this.regionDisplay, {
            childList: true,
            characterData: true,
            subtree: true
        });

        locationObserver.observe(this.locationDisplay, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    async updateRegionScreen(regionName) {
        if (this.isUpdating) {
            this.updateQueue.push({ type: 'region', value: regionName });
            return;
        }

        this.isUpdating = true;
        try {
            const regionId = await getRegionIdByName(regionName);
            await createRegionScreen(regionId);
        } catch (error) {
            console.error(`❌ Erro ao atualizar region screen:`, error);
        } finally {
            this.isUpdating = false;
            this.processQueue();
        }
    }

    async updateLocationScreen(locationName) {
        if (this.isUpdating) {
            this.updateQueue.push({ type: 'location', value: locationName });
            return;
        }

        this.isUpdating = true;
        try {
            const locationId = await getLocationIdByName(locationName);
            await createLocationScreen(locationId);
        } catch (error) {
            console.error(`❌ Erro ao atualizar location screen:`, error);
        } finally {
            this.isUpdating = false;
            this.processQueue();
        }
    }

    async updatePokemonScreen() {
        if (this.isUpdating) {
            this.updateQueue.push({ type: 'pokemon', value: null });
            return;
        }

        this.isUpdating = true;
        try {
            await createPokemonScreen();
            setTimeout(() => {
                editPokemonsCard();
            }, 10);
        } catch (error) {
            console.error(`❌ Erro ao atualizar pokemon screen:`, error);
        } finally {
            this.isUpdating = false;
            this.processQueue();
        }
    }

    processQueue() {
        if (this.updateQueue.length > 0) {
            const next = this.updateQueue.shift();
            setTimeout(() => {
                if (next.type === 'region') {
                    this.updateRegionScreen(next.value);
                } else if (next.type === 'location') {
                    this.updateLocationScreen(next.value);
                } else if (next.type === 'pokemon') {
                    this.updatePokemonScreen();
                }
            }, 100);
        }
    }

    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Métodos públicos para controle manual
    setActiveScreen(screenType) {
        this.currentScreen = screenType;
        this.dispatchCustomEvent('screenActivated', { screenType });
    }

    async forceUpdate() {
        if (this.currentScreen === 'region') {
            await this.updateRegionScreen(this.regionDisplay.textContent.trim());
        } else if (this.currentScreen === 'location') {
            await this.updateLocationScreen(this.locationDisplay.textContent.trim());
        } else if (this.currentScreen === 'pokemon') {
            await this.updatePokemonScreen();
        }
    }

    getStatus() {
        return {
            currentScreen: this.currentScreen,
            isUpdating: this.isUpdating,
            queueLength: this.updateQueue.length,
            regionName: this.regionDisplay.textContent.trim(),
            locationName: this.locationDisplay.textContent.trim()
        };
    }
}

const screenStateManager = new ScreenStateManager();

// Exportar para uso em outros módulos
export { screenStateManager };

// Expor globalmente para debugging
window.screenStateManager = screenStateManager;
