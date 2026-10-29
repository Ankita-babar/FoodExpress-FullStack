# 🍔 FoodExpress — Full-Stack Food Delivery Application

FoodExpress is a full-stack online food delivery web application built with HTML, CSS, JavaScript, Java Spring Boot, and MySQL. It demonstrates how a web frontend communicates with a REST API and how application data is persisted in a relational database.

The project includes food browsing, search, cart management, checkout, order placement, and an administrative interface for food management.

**Repository:** [FoodExpress-FullStack](https://github.com/Ankita-babar/FoodExpress-FullStack)

## ✨ Features

- **Food browsing:** Explore food items and view the available menu.
- **Search and filtering:** Find food items using the available menu functionality.
- **Shopping cart:** Add food items and manage quantities.
- **Checkout:** Submit food orders through the checkout workflow.
- **Order processing:** Send order data to the backend and persist it in MySQL.
- **Admin interface:** Access the administrative login and food-management dashboard.
- **REST API:** Connect the frontend to the Spring Boot backend.
- **Relational database:** Store food, customer, and order-related information in MySQL.
- **Security configuration:** Configure protected backend routes and administrative authentication.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, jQuery, Bootstrap |
| Backend | Java 21, Spring Boot 4.1.1 |
| Database | MySQL 8 |
| Data access | Spring Data JPA, Hibernate |
| API | REST, JSON |
| Security | Spring Security, CSRF protection |
| Build tool | Maven |
| Development tools | VS Code, IntelliJ IDEA, Postman, Git, GitHub |

## 🏗️ Project Architecture

FoodExpress follows a frontend–backend–database architecture.

```text
                 CUSTOMER / ADMIN
                        |
                        v
              HTML, CSS, JavaScript
                jQuery / Bootstrap
                        |
                        v
                   REST APIs
                        |
                        v
              Spring Boot Backend
              +------------------+
              | Controllers      |
              | Security Config   |
              | JPA Repositories |
              | Entity Classes   |
              +------------------+
                        |
                        v
                 Spring Data JPA
                    Hibernate
                        |
                        v
                   MySQL 8
                   foodexpress
```

### Request and data flow

1. A customer interacts with the frontend to browse food or submit an order.
2. JavaScript sends HTTP requests to the Spring Boot API.
3. Backend controllers process incoming requests.
4. Spring Data JPA and Hibernate communicate with MySQL.
5. The backend returns a response, typically in JSON format.
6. The frontend updates the relevant page based on the response.

## 📁 Project Structure

```text
FoodExpress Project/
│
├── FoodExpress HTML/
│   └── menu.html
│
├── CSS/
│   └── Frontend stylesheets
│
├── JavaScript/
│   ├── script.js
│   ├── menu-api.js
│   ├── cart.js
│   ├── checkout-api.js
│   └── admin.js
│
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/com/foodexpress/backend/
│       │   │   ├── BackendApplication.java
│       │   │   ├── AuthController.java
│       │   │   ├── SecurityConfig.java
│       │   │   ├── Food.java
│       │   │   ├── FoodRepository.java
│       │   │   ├── Customer.java
│       │   │   ├── CustomerRepository.java
│       │   │   ├── CustomerOrder.java
│       │   │   ├── OrderItem.java
│       │   │   ├── OrderRequest.java
│       │   │   └── OrderRepository.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│
├── admin-login.html
├── admin.html
├── menu.html
├── checkout.html
├── .gitignore
└── README.md
```

*Note: The tree highlights the main project files. Some supporting frontend files and backend classes are omitted for readability.*

## ⚙️ Prerequisites

Install the following before running the project:

- Java Development Kit (JDK) 21
- MySQL Server 8
- Git
- Visual Studio Code or another code editor
- A modern web browser
- Maven, or use the included Maven Wrapper

Verify your installations:

```bash
java -version
mysql --version
git --version
```

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ankita-babar/FoodExpress-FullStack.git
cd FoodExpress-FullStack
```

### 2. Create the MySQL database

Open your MySQL client:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE foodexpress;
USE foodexpress;
```

Exit the MySQL client:

```sql
EXIT;
```

Configure your MySQL username and password through environment variables. Do not commit real credentials to GitHub.

### 3. Configure the backend

Open the backend configuration:

```bash
code backend/src/main/resources/application.properties
```

Configure the database connection using environment variables:

```properties
spring.application.name=foodexpress-backend

spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/foodexpress}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

server.port=8080
logging.level.org.springframework.security=INFO
```

Set the variables in the terminal used to start the backend:

```bash
export DB_URL="jdbc:mysql://localhost:3306/foodexpress"
export DB_USERNAME="your_mysql_username"
export DB_PASSWORD="your_mysql_password"
```

Replace the example values locally. Never commit real passwords or an environment file containing secrets.

The application uses Hibernate schema updates, so JPA-managed tables can be created or updated when the backend starts. Back up important data before making schema changes.

### 4. Start the Spring Boot backend

From the project root:

```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

The backend should start at:

`http://localhost:8080`

Keep this terminal running.

### 5. Start the frontend

Open a second terminal and return to the project root:

```bash
cd "/path/to/FoodExpress-FullStack"
```

Replace the example path with the actual location of your cloned repository.

Open the project in VS Code and use the Live Server extension to serve the frontend. Configure the frontend origin consistently with the backend's CORS settings; the current development setup uses port `5500`.

For example:

`http://localhost:5500`

Open the appropriate frontend page from the served project.

**Important:** Use the same frontend origin configured in the backend security settings. A mismatched port or origin can cause browser CORS errors.

## 🗄️ Database Design

FoodExpress uses MySQL because the application contains related entities and benefits from relational tables, primary keys, foreign keys, transactions, and structured queries.

The main entity classes in the backend are `Food`, `Customer`, `CustomerOrder`, and `OrderItem`.

| Entity | Purpose |
|---|---|
| `Food` | Represents food items available in the menu. |
| `Customer` | Represents customer information. |
| `CustomerOrder` | Represents an order submitted by a customer. |
| `OrderItem` | Represents food items and quantities associated with an order. |

### Conceptual entity relationship

```text
CUSTOMER
   |
   | places
   v
CUSTOMER_ORDER
   |
   | contains
   v
ORDER_ITEM
   |
   | references
   v
FOOD
```

This is a conceptual relationship diagram. The exact foreign-key mappings, cardinalities, column names, and constraints should be taken from the entity annotations in the backend source code.

### Database initialization

The database itself is created manually with `CREATE DATABASE foodexpress`. Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update` to manage JPA entity tables.

To inspect the database after starting the backend:

```sql
USE foodexpress;
SHOW TABLES;
```

Inspect a particular table:

```sql
DESCRIBE food;
```

Use the actual table name shown by `SHOW TABLES` if your database uses a different name.

## 🔌 API Endpoints

The frontend communicates with the Spring Boot backend using HTTP requests.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/foods` | Retrieve food items for browsing. |
| GET | `/api/foods/admin` | Retrieve food items for the administrative interface. |
| GET | `/api/auth/csrf` | Obtain CSRF information for protected requests. |
| POST | `/login` | Submit administrative login credentials. |

Backend base URL:

`http://localhost:8080`

Example request:

```bash
curl -i http://localhost:8080/api/foods
```

Check the CSRF endpoint:

```bash
curl -i http://localhost:8080/api/auth/csrf
```

Order-related endpoints are implemented in the backend controllers. Refer to `OrderController.java` for the exact routes, HTTP methods, and request formats before adding them to this table.


## 🧪 Testing and Verification

Verify the backend and database connection before testing the complete application.

1. Start MySQL.
2. Start the Spring Boot backend.
3. Call the food API and inspect the JSON response.
4. Open the frontend using Live Server.
5. Browse the menu and add food items to the cart.
6. Submit a test order and confirm the order is saved in MySQL.
7. Test administrative login and food-management functionality separately.

Run the backend tests with:

```bash
cd backend
./mvnw test
```

## 🔒 Security Notes

- Keep database credentials out of source control.
- Configure administrative credentials through environment variables.
- Do not publish session cookies, CSRF tokens, or passwords.
- Use HTTPS and production-appropriate security settings when deploying.
- Review CORS rules and protected endpoints before exposing the application publicly.
- Avoid detailed security logging in production.

## 🛠️ Troubleshooting

| Problem | What to check |
|---|---|
| Backend does not start | Verify Java version, Maven output, and port `8080`. |
| MySQL connection fails | Check that MySQL is running, the database exists, and environment variables are set. |
| Frontend cannot reach the API | Check the backend process, API URL, CORS configuration, and frontend origin. |
| Browser reports a CORS error | Ensure the frontend origin matches the backend security configuration and preflight requests are allowed. |
| Food menu is empty | Test `/api/foods` and inspect the database tables. |
| Checkout fails | Inspect the browser console, backend logs, order request payload, and database state. |
| Admin login fails | Verify configured credentials, CSRF handling, session cookies, and Spring Security rules. |

## 🔮 Future Improvements

- Complete and verify the administrator authentication workflow.
- Improve admin dashboard error handling.
- Add automated integration tests for order placement and food management.
- Document all controller mappings and request/response examples.
- Add database migrations for controlled schema changes.
- Deploy the frontend and backend with environment-specific configuration.

## 🎓 Learning Outcomes

This project demonstrates practical experience with:

- Full-stack web application development
- Java and Spring Boot REST APIs
- MySQL database connectivity
- Relational entity modelling and JPA
- Frontend-to-backend integration
- Cart and checkout workflows
- Authentication and CSRF concepts
- Git and GitHub version control

## 👩‍💻 Author

**Ankita Babar**

- GitHub: [Ankita-babar](https://github.com/Ankita-babar)
- LinkedIn: [Ankita Babar](https://linkedin.com/in/ankita-babar-93b503371)

---

*FoodExpress is a full-stack learning project developed to explore food ordering workflows, backend APIs, database persistence, and web application integration.*
