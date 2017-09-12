# Coding Conventions for AWS Cloud Platform

## Formatting

### Bash

#### Indentation

Two spaces. No tabs.

#### Loops and conditions

Put **; do** and **; then** on the same line as the **while**, **for** or **if**.

Good example

    for i in {1..3}; do
      echo $i
    done

Bad example

    for i in {1..3}
    do
      echo $i
    done
