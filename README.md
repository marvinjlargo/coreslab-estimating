# Hollow-Core Slab Calculator

A static, client-side calculator for determining hollow-core slab configurations based on span and load requirements. Built with vanilla JavaScript, HTML, and CSS.

## Features

- **Dual Unit Support**
  - Imperial (ft / psf)
  - Metric (m / kPa)
  - Automatic unit conversion and display

- **Interactive Chart**
  - High-DPI rendering for crisp visuals
  - Dynamic zooming around target values
  - Interactive tooltips with detailed information
  - Smooth hover effects and transitions

- **Comprehensive Results**
  - Exact configuration matches
  - Alternative configurations when exact match not found
  - Visual capacity curve representation
  - Export functionality (copy/download)

## Technical Details

- **Static & Offline**
  - No server requirements
  - No external dependencies
  - Pure vanilla JavaScript
  - Client-side data processing

- **Performance Optimized**
  - Efficient data filtering
  - Smooth chart rendering
  - Responsive design
  - Mobile-friendly interface

## Usage

1. Select your preferred unit system (Imperial or Metric)
2. Enter the required span length
3. Enter the superimposed load
4. Select the slab thickness
5. Click "Calculate" to see results

The calculator will:
- Find the optimal configuration
- Show alternative options if needed
- Display a visual capacity curve
- Allow exporting results

## Data Structure

The calculator uses JSON data files:
- `data/imperial_data.json` - Imperial unit configurations
- `data/metric_data.json` - Metric unit configurations

Each configuration includes:
- Thickness
- Number of strands
- Span capacity
- Load capacity

## Browser Support

Works in all modern browsers that support:
- Canvas API
- ES6 JavaScript features
- CSS Flexbox/Grid

## License

This project is open source and available for use under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 