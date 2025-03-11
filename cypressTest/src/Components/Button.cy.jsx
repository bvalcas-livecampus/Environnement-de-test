import React from 'react'
import Button from './Button'

describe('Test Button component', () => {
  it('renders', () => {
    cy.mount(<Button />)
  })
  it('renders with a good label', () => {
    cy.mount(<Button label="Hello there" />)
    cy.contains("Hello there").should('exist')
  })
  it('Test button take click', () => {
    const clicker = cy.spy()
    cy.mount(<Button label="Hello there" onClick={clicker}/>)
    cy.contains("Hello there").should('exist')
    cy.contains("Hello there").click()
    cy.wrap(clicker).should('have.been.calledOnce')
  })
})