/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { Doc } from "@/convex/_generated/dataModel";

// Registramos una fuente estándar
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' },
  ]
});

// Helper para crear estilos dinámicos basados en el color
const createStyles = (primaryColor: string) => StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginVertical: 15,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    borderBottomWidth: 2,
    borderBottomColor: primaryColor, // <--- COLOR DINÁMICO
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerText: {
    fontSize: 8,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBranding: { 
    fontSize: 8,
    color: "#9CA3AF",
    fontStyle: 'italic',
  },
  pageNumber: {
    fontSize: 9,
    color: "#6B7280",
  },
  // --- PORTADA ---
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b', // Fondo oscuro
    color: 'white',
  },
  coverContent: {
    width: '100%',
    padding: 40,
    borderLeftWidth: 10,
    borderLeftColor: primaryColor, // <--- COLOR DINÁMICO
  },
  brandLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    objectFit: 'contain',
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    color: primaryColor, // <--- COLOR DINÁMICO
  },
  reportTitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  metaContainer: {
    marginTop: 40,
    flexDirection: 'row',
    gap: 40,
  },
  metaItem: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 10,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  // --- CONTENIDO ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: primaryColor, // <--- COLOR DINÁMICO
    textTransform: "uppercase",
  },
  findingCard: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  findingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 8,
    color: "white",
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  text: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 4,
    textAlign: 'justify',
  },
  imageContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  evidenceImage: {
    width: 200,
    height: 120,
    objectFit: 'cover',
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  }
});

interface PdfReportProps {
  project: Doc<"projects">;
  vulnerabilities: any[]; 
  settings?: any; // Configuración de la org
  isPro?: boolean;
}

export const PdfReport = ({ project, vulnerabilities, settings, isPro = false }: PdfReportProps) => {
  // Valores por defecto (verde esmeralda si no hay config)
  const primaryColor = settings?.primaryColor || "#10b981"; 
  const logoUrl = settings?.logoUrl;
  const styles = createStyles(primaryColor);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "#EF4444";
      case "high": return "#F97316";
      case "medium": return "#EAB308";
      case "low": return "#3B82F6";
      default: return "#3B82F6";
    }
  };

  return (
    <Document>
      {/* --- PORTADA --- */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverContent}>
            {/* LOGO: Solo si es PRO y existe la URL */}
            {isPro && logoUrl ? (
                <Image src={logoUrl} style={styles.brandLogo} />
            ) : null}

          {/* Si no hay logo, o como título complementario, el nombre de la empresa */}
          {/* Aquí podrías agregar un campo 'companyName' a settings si quisieras */}
          <Text style={styles.brandTitle}>
             CONFIDENTIAL
          </Text>
          
          <Text style={styles.reportTitle}>Reporte de Vulnerabilidades</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Proyecto</Text>
              <Text style={styles.metaValue}>{project.name}</Text>
            </View>
            <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Fecha</Text>
                <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* --- PÁGINAS DE CONTENIDO --- */}
      <Page size="A4" style={styles.page} wrap>
        
        {/* HEADER: Se repite en todas las páginas */}
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>{project.name} - Security Report</Text>
          <Text style={styles.headerText}>{new Date().toLocaleDateString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
        <Text style={styles.text}>
            Este documento detalla las vulnerabilidades encontradas durante el análisis de seguridad realizado para el proyecto "{project.name}".
            Se recomienda revisar los hallazgos y priorizar la remediación de los items críticos y de alta severidad.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Hallazgos Detallados</Text>

        {vulnerabilities?.map((vuln, index) => (
          <View key={index} style={{...styles.findingCard, borderLeftColor: getSeverityColor(vuln.severity)}} wrap={false}>
             <Text style={{...styles.badge, backgroundColor: getSeverityColor(vuln.severity)}}>
                {vuln.severity.toUpperCase()}
             </Text>
             <Text style={styles.findingTitle}>{vuln.title}</Text>
             
             <Text style={styles.label}>Descripción</Text>
             <Text style={styles.text}>{vuln.description}</Text>

             {vuln.remediation && (
                 <>
                    <Text style={styles.label}>Remediación</Text>
                    <Text style={styles.text}>{vuln.remediation}</Text>
                 </>
             )}

             {/* EVIDENCIAS */}
             {vuln.imageUrls && vuln.imageUrls.length > 0 && (
                 <View style={styles.imageContainer}>
                     {vuln.imageUrls.map((url: string, i: number) => (
                         <Image key={i} src={url} style={styles.evidenceImage} />
                     ))}
                 </View>
             )}
          </View>
        ))}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
           <View>
                {/* MARCA DE AGUA: Solo se muestra si NO es Pro */}
                {!isPro && (
                    <Text style={styles.footerBranding}>Generated by RootReport (Free Tier)</Text>
                )}
           </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};