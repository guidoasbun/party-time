// Basic test to verify Jest setup is working
describe('Jest Setup', () => {
  it('should be able to run tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to testing-library matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    document.body.appendChild(element)
    
    expect(element).toBeInTheDocument()
  })
})