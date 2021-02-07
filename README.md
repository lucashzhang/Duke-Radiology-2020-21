# Duke Radiology Project

This is the second iteration of the project created for radiologists Yang Sheng and Jackie Wu at Duke Radiology.

## Basis

The basis of this project is built from "Atlas-guided prostate intensity modulated radiation therapy (IMRT) planning" by Yang Sheng, Jackie Wu, Yaorong Ge, and others. It also uses "Utilizing Knowledge-Based Models to Teach Complex Lung IMRT Planning" by Matt Mistro.

## Technologies

This program can parse a set selection of DICOM files ([See DICOM standard here](https://www.dicomstandard.org/)) to either display the header data as plain text, or show the series of CT Images with it's specially generated overlays. The project primarily uses ReactJS and NodeJS, but the entire application is then packaged using ElectronJS to bind the frontend UI and backend processing into one complete desktop application. In order to line up the all of the overlay data and generate the orthagonal views from the CT image series with relative accuracy, the application uses both linear and bilinear interpolation. This is all done within webworkers on background threads to allow for concurrent image processing and while easing off of the main UI thread.

# IMPORTANT, DO NOT USE THIS SOFTWARE IN A PROFESSIONAL SETTING

This project is still in development and therefore has not been tested for bugs. Neither has it been tested to confirm the precision and accuracy expected of medical grade software.
