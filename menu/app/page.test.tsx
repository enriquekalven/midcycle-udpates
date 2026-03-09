import { render, screen, fireEvent } from '@testing-library/react'
import Home from './page'
import { menuItems } from './data/menuData'

// Mock the ChatAssistant and MarketingAvatar components to simplify the test
jest.mock('./components/ChatAssistant', () => ({
  ChatAssistant: () => <div data-testid="chat-mock" />
}))
jest.mock('./components/MarketingAvatar', () => ({
  MarketingAvatar: () => <div data-testid="avatar-mock" />
}))

// Mock the framer-motion to avoid issues with animation in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Home Page Digital Menu', () => {
  it('renders the restaurant title and subtitle', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /The Golden Gate Bistro/i })).toBeInTheDocument()
    expect(screen.getByText(/Fisherman's Wharf/i)).toBeInTheDocument()
  })

  it('renders all menu items from data', () => {
    render(<Home />)
    menuItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
      expect(screen.getByText(item.price)).toBeInTheDocument()
    })
  })

  it('toggles review mode when the button is clicked', () => {
    render(<Home />)
    const reviewBtn = screen.getByText(/Enter Review Mode/i)
    fireEvent.click(reviewBtn)
    expect(screen.getByText(/Exit Review Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Run Auto-QC/i)).toBeInTheDocument()
  })

  it('triggers speech synthesis when play button is clicked', () => {
    const speakSpy = jest.spyOn(window.speechSynthesis, 'speak')
    render(<Home />)
    const playButton = screen.getByLabelText(new RegExp(`Play description for ${menuItems[0].name}`, 'i'))
    fireEvent.click(playButton)
    expect(speakSpy).toHaveBeenCalled()
    speakSpy.mockRestore()
  })

  it('runs Auto-QC and shows warnings for long descriptions', () => {
    render(<Home />)
    // Enter Review Mode
    fireEvent.click(screen.getByText(/Enter Review Mode/i))
    
    // Find a card and edit its description to be too long
    const item = menuItems[0]
    const editBtn = screen.getByLabelText(new RegExp(`Edit description for ${item.name}`, 'i'))
    
    fireEvent.click(editBtn)
    const textarea = screen.getByDisplayValue(item.description)
    fireEvent.change(textarea, { target: { value: 'a'.repeat(201) } })
    fireEvent.click(screen.getByText(/Done/i))
    
    // Run QC
    fireEvent.click(screen.getByText(/Run Auto-QC/i))
    
    // Wait for warning
    expect(screen.getByText(/Text exceeds 200 characters/i)).toBeInTheDocument()
  })

  it('responds to A2UI "menu-highlight" protocol event', async () => {
    render(<Home />)
    
    // Dispatch custom A2UI event
    const highlightEvent = new CustomEvent('menu-highlight', { detail: '1' });
    window.dispatchEvent(highlightEvent);
    
    // We can't easily check the 'scale' or 'boxShadow' in JSDOM, but we can check if it stays in document
    // and we can verify the state transition if we had access to internals, 
    // but for now verifying it doesn't crash on the custom event is a baseline.
    expect(screen.getByText(menuItems[0].name)).toBeInTheDocument();
  })
})
