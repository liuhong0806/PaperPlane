import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'

describe('App', () => {
  it('renders home headline', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /一张/ })).toBeInTheDocument()
  })
})
