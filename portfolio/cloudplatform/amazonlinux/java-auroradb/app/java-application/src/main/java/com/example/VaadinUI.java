package com.example;

import com.vaadin.data.Binder;
import com.vaadin.server.VaadinRequest;
import com.vaadin.spring.annotation.SpringUI;
import com.vaadin.ui.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@SpringUI
public class VaadinUI extends UI {

  @Autowired
  private CustomerService service;

  private Customer customer;

  private Binder<Customer> binder = new Binder<>(Customer.class);

  private Grid<Customer> grid = new Grid(Customer.class);
  private TextField firstName = new TextField("First name");
  private TextField lastName = new TextField("Last name");
  private Button update = new Button("Update", e -> updateCustomer());
  private Button add = new Button("Add", e -> addCustomer());
  private Button delete = new Button("Delete", e -> deleteCustomer());

  @Override
  protected void init(VaadinRequest request) {
    // grid.setWidth("100%");
    updateGrid();
    grid.setColumns("firstName", "lastName");
    grid.setWidth("100%");
    grid.addSelectionListener(e -> updateForm());
    binder.bindInstanceFields(this);

    VerticalLayout layout = new VerticalLayout(grid, firstName, lastName, add, update, delete);
    layout.setComponentAlignment(grid,  Alignment.MIDDLE_CENTER);
    layout.setComponentAlignment(firstName,  Alignment.MIDDLE_CENTER);
    layout.setComponentAlignment(lastName,  Alignment.MIDDLE_CENTER);
    layout.setComponentAlignment(add,  Alignment.MIDDLE_CENTER);
    layout.setComponentAlignment(update,  Alignment.MIDDLE_CENTER);
    layout.setComponentAlignment(delete,  Alignment.MIDDLE_CENTER);

    setContent(layout);
  }

  private void updateGrid() {
    List<Customer> customers = service.findAll();
    grid.setItems(customers);
    setFormVisible(true);
  }

  private void updateForm() {
    if (grid.asSingleSelect().isEmpty()) {
      setFormVisible(true);
    }
    else {
      customer = grid.asSingleSelect().getValue();
      binder.setBean(customer);
      setFormVisible(true);
    }
  }

  private void setFormVisible(boolean visible) {
    firstName.setVisible(visible);
    lastName.setVisible(visible);
    update.setVisible(visible);
    add.setVisible(visible);
    delete.setVisible(visible);
  }

  private void updateCustomer() {
    service.update(customer);
    updateGrid();
  }

  private void addCustomer() {
    service.add(firstName.getValue(),lastName.getValue());
    updateGrid();
  }

  private void deleteCustomer() {
    service.delete(customer);
    updateGrid();
  }
}
