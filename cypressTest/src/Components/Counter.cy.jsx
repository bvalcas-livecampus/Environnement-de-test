import React from 'react'
import Counter from './Counter'

describe('Test Button component', () => {
  it('renders', () => {
    cy.mount(<Counter />)
    cy.contains('Count: 0').should('exist')
  })
  it('increment test', () => {
    cy.mount(<Counter />)
    cy.contains('Count: 0').should('exist')
    cy.contains('Increment').click()
    cy.contains('Count: 1').should('exist')
  })
  it('increment until 3 test', () => {
    cy.mount(<Counter />)
    cy.contains('Count: 0').should('exist')
    cy.contains('Increment').click()
    cy.contains('Count: 1').should('exist')
    cy.contains('Increment').click()
    cy.contains('Count: 2').should('exist')
    cy.contains('Increment').click()
    cy.contains('Count: 3').should('exist')
  })
})