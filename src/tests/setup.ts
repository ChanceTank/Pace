import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('/electron-vite.animate.svg', () => ({ default: 'mocked-svg' }))
vi.mock('./assets/react.svg', () => ({ default: 'mocked-svg' }))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => null),
    },
    writable: true,
})
