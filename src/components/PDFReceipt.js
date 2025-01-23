import React, { useEffect, useState } from "react";
import { Modal, Text, Button, Alert } from "react-native";
import { PDFDocument, rgb } from "react-native-pdf-lib"; // Import PDF-lib

// Optional: If you want to use react-native-fs to save the PDF locally
// import RNFS from 'react-native-fs';

const PDFReceipt = ({ show, onHide, transactionDetails }) => {
  const [pdfPath, setPdfPath] = useState(null);

  const generatePDF = async () => {
    if (!transactionDetails) return;

    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const { width, height } = page.getSize();

    page.drawText("Transaction Receipt", { x: 20, y: height - 40, fontSize: 18, color: rgb(0, 0, 0) });
    page.drawText(`Network: ${transactionDetails.network}`, { x: 20, y: height - 80 });
    page.drawText(`Plan: ${transactionDetails.planTitle}`, { x: 20, y: height - 100 });
    page.drawText(`Phone Number: ${transactionDetails.mobile_number}`, { x: 20, y: height - 120 });
    page.drawText(`Amount: ₦${transactionDetails.amount}`, { x: 20, y: height - 140 });
    page.drawText(`Date: ${new Date().toLocaleString()}`, { x: 20, y: height - 160 });
    page.drawText(`Status: Success`, { x: 20, y: height - 180 });

    const path = await doc.write();
    setPdfPath(path);
  };

  // const downloadPDF = async () => {
  //   if (pdfPath) {
  //     try {
  //       const destPath = `${RNFS.DocumentDirectoryPath}/Transaction_Receipt.pdf`;
  //       await RNFS.copyFile(pdfPath, destPath);
  //       console.log("PDF saved successfully to:", destPath);
  //       Alert.alert("Success", "PDF saved successfully!");
  //     } catch (error) {
  //       console.error("Error saving PDF:", error);
  //     }
  //   }
  // };

  useEffect(() => {
    if (transactionDetails) {
      generatePDF();
    }
  }, [transactionDetails]);

  return (
    <Modal visible={show} onRequestClose={onHide} animationType="slide">
      <Text>Plan: {transactionDetails.planTitle}</Text>
      <Text>Phone Number: {transactionDetails.mobile_number}</Text>
      <Text>Amount: ₦{transactionDetails.amount}</Text>
      <Text>Date: {new Date().toLocaleString()}</Text>
      <Text>Status: Success</Text>
      
      <Button title="Cancel" onPress={onHide} />
      <Button title="Download PDF" onPress={downloadPDF} />
    </Modal>
  );
};

export default PDFReceipt;
