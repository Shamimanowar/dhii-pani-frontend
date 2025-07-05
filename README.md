# DHII Pani - Environmental Water Quality Monitoring System

> **A cutting-edge IoT-enabled environmental monitoring solution designed specifically for Bangladesh's Department of Environment (DoE) to ensure industrial compliance and sustainable water management.**

---

*This comprehensive system represents the next generation of environmental monitoring technology, combining real-time sensor data collection with intelligent web-based analytics. Developed to support Bangladesh's commitment to environmental protection and industrial sustainability, the DHII Pani platform provides unprecedented visibility into industrial water treatment processes while ensuring regulatory compliance with DoE standards.*

## Project Overview

The **DHII Pani** system is a comprehensive environmental monitoring solution developed for the Department of Environment (DoE), Bangladesh. This system enables real-time monitoring and management of water quality parameters for industrial Effluent Treatment Plants (ETPs), with a focus on textile and other manufacturing industries.

## System Architecture

### 🏗️ Complete IoT to Web Solution

The system consists of four main components:

1. **Hardware Layer**: IoT sensors connected to controllers
2. **Backend Server**: Robust data processing and storage system
3. **Admin Portal**: Management interface for administrators and staff
4. **Factory Portal**: User interface for factory owners (this frontend)

### 📊 Data Flow

```
Sensors → Controller → Backend Server → PostgreSQL Database → Frontend Portal
```

## Backend Infrastructure

### 🔧 Core Features

- **Multi-Protocol Support**: 
  - TCP requests from frontend (dhii.grnmfg.com)
  - MQTT requests from sensor controllers
- **Authentication System**:
  - Password-based authentication
  - OTP-based verification
  - X app authentication for 3rd party applications
- **Data Management**:
  - PostgreSQL database with automatic daily backups
  - Configurable sensor value ranges (upper/lower limits)
  - Factory management and tracking
  - Advanced filtering and searching capabilities

### 🛡️ Security & Access Control

- Role-based access control (RBAC)
- Secure token management for 3rd party apps
- OTP record storage and verification
- Factory-specific data isolation

## Frontend Features

### 📱 User Interface

The frontend provides **6 main pages**:

1. **Landing Page** - DoE information and important articles
2. **Data Table** - Tabular view of sensor data
3. **Summary Dashboard** - Statistical overview with pie charts
4. **Graphical Dashboard** - Interactive charts and graphs
5. **Login Page** - Secure authentication
6. **404 Error Page** - User-friendly error handling

### 🚀 Key Features

#### 📊 Data Visualization
- **Interactive Charts**: Line charts, area charts, pie charts using Recharts
- **Real-time Data**: Live sensor data display
- **Statistical Analysis**: Mean, min, max, and range calculations
- **Color-coded Status**: In-range, out-of-range, and missing data indicators

#### 📤 Export Capabilities
- **Multiple Formats**: 
  - PNG/PDF exports for dashboards
  - CSV exports for tabular data
  - JSON exports for raw data
- **Customizable Export Count**: Select specific number of rows to export
- **Factory-specific Naming**: Automatic file naming based on logged-in factory

#### ⚡ Performance Features
- **Auto Refresh**: Configurable intervals (3, 10, 30, 60 minutes)
- **Date Range Filtering**: Custom date/time range selection
- **Metric Filtering**: View specific sensor parameters
<!-- - **Responsive Design**: Mobile and desktop optimized -->

#### 🔍 Data Management
- **Pagination**: Efficient data loading with 20 records per page
- **Real-time Updates**: Live data refresh without page reload
- **Session Storage**: Cached data for improved performance
- **Error Handling**: Graceful error management and user feedback

### 🎯 Monitored Parameters

The system tracks the following water quality parameters:

| Parameter | Unit | Description |
|-----------|------|-------------|
| **Temperature** | °C | Water temperature |
| **BOD** | mg/L | Biochemical Oxygen Demand |
| **COD** | mg/L | Chemical Oxygen Demand |
| **pH** | - | Acidity/Alkalinity level |
| **TDS** | mg/L | Total Dissolved Solids |
| **DO** | mg/L | Dissolved Oxygen |
| **COLOR** | Pt.Co | Color measurement |
| **TSS** | mg/L | Total Suspended Solids |

## Technical Implementation

### 🛠️ Technology Stack

- **Framework**: Next.js 15.3.2 with React 19.0.0
- **Styling**: CSS modules with responsive design
- **Charts**: Recharts library for data visualization
- **Export**: html2canvas and jsPDF for document generation
- **Authentication**: Cookie-based session management
- **Development**: TypeScript support with ESLint

### 🔄 API Integration

The frontend communicates with the backend through:

- **Data API** (`/api/data`): Fetches sensor data with filtering
- **Limits API** (`/api/sensor-data-range`): Retrieves acceptable value ranges
- **Login API** (`/api/login`): Handles user authentication

### 📈 Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Data Caching**: Session storage for frequently accessed data
- **Pagination**: Efficient data loading strategy
- **Responsive Charts**: Optimized for different screen sizes


## Benefits for Factory Owners

### 🏭 Operational Advantages

- **Real-time Monitoring**: Instant visibility into ETP performance
- **Compliance Tracking**: Easy monitoring of DoE compliance parameters
- **Data Export**: Generate reports for regulatory submissions
- **Historical Analysis**: Track performance trends over time
- **Alert System**: Visual indicators for out-of-range values

### 📊 Business Intelligence

- **Performance Metrics**: Statistical analysis of treatment efficiency
- **Trend Analysis**: Identify patterns and optimization opportunities
- **Regulatory Compliance**: Ensure adherence to environmental standards
- **Cost Optimization**: Data-driven decisions for ETP operations

## Deployment & Maintenance

### 🚀 Production Setup

- **Environment**: Production-ready Next.js deployment
- **Database**: PostgreSQL with automated daily backups
- **Monitoring**: Real-time system health monitoring
- **Security**: Regular security updates and patches

### 📞 Support

The system includes comprehensive error handling and user-friendly interfaces to minimize support requirements while providing industrial-grade reliability for critical environmental monitoring applications.

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

*This system represents a complete IoT-to-web solution for environmental monitoring, supporting Bangladesh's industrial environmental compliance and sustainability goals.*

---

## 🤝 Professional Development Services

**For Department of Environment (DoE) and Industrial Partners**

If you require additional environmental monitoring solutions, web applications, or technical systems to support your environmental compliance and sustainability initiatives, I am available to provide comprehensive development services.

### 📧 Contact Information

**Shamim Ahmed**  
*Full-Stack Developer & Environmental Tech Solutions Specialist*

- **Email**: shamim.hire@gmail.com  
- **Phone**: +880 1612 879888  
- **Services**: Custom web applications, Mobile Applications, AI Chatbots, IoT solutions, database systems, and environmental monitoring platforms

### 🌱 Commitment to Environmental Technology

*I am dedicated to developing innovative technology solutions that support Bangladesh's environmental protection goals and help industries achieve sustainable operations while maintaining regulatory compliance.*

---

**© 2025 DHII Pani Environmental Monitoring System**
