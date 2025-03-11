import React from 'react'
import InputField from './InputField'

describe('Test Button component', () => {
  it('renders with a placeholder', () => {
    cy.mount(<InputField placeholder="Hello There"/>)
    cy.get('input').should('have.attr', 'placeholder', 'Hello There')
  })
  it('renders with a placeholder', () => {
    cy.mount(<InputField placeholder="Hello There"/>)
    cy.get('input').type('Bonjour le monde !')
    cy.contains('Value: Bonjour le monde !').should('exist')
  })
})