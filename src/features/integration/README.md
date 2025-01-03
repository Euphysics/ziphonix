## Integration Directory

This directory contains modules that integrate multiple features of the project.

Each feature exists as a separate module within the `features/feature_name` directory, such as `features/account`, `features/auth`, etc.

In cases where a task requires combining multiple features (e.g., registering a user, which involves both `features/auth` and `features/account`), we create a new module in the integration directory to handle this. Instead of creating a dedicated module for every combination of features, we use this directory to organize and manage such integrations efficiently.
