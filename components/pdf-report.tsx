import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { Doc } from "@/convex/_generated/dataModel";

const styles = StyleSheet.create({
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
    borderBottomColor: "#10b981",
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
  pageNumber: {
    fontSize: 9,
    color: "#6B7280",
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
    color: 'white',
  },
  coverContent: {
    width: '100%',
    padding: 40,
    borderLeftWidth: 10,
    borderLeftColor: '#10b981',
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    color: '#10b981',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginTop: 4,
  },
  vulnContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  vulnHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  vulnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    width: "70%",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    color: 'white',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  vulnBody: {
    padding: 15,
  },
  fieldLabel: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  fieldContent: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'justify',
  },

  // --- SOLUCIÓN DE MARCA DE AGUA (Corrección de Texto Cortado) ---
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, 
  },
  watermarkText: {
    fontSize: 60,
    color: 'rgba(16, 185, 129, 0.1)', // Opacidad baja para no molestar
    transform: 'rotate(-45deg)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    // TRUCO PARA QUE NO SE CORTE:
    width: 1000,        // Forzamos un ancho enorme
    textAlign: 'center' // Centramos el texto dentro de ese ancho
  },

  // --- ESTILOS PARA IMÁGENES ---
  evidenceContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  evidenceImage: {
    width: '100%',
    height: 200, 
    objectFit: 'contain',
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },

  // Colores de severidad
  bgCritical: { backgroundColor: "#ef4444" },
  bgHigh: { backgroundColor: "#f97316" },
  bgMedium: { backgroundColor: "#eab308" },
  bgLow: { backgroundColor: "#3b82f6" },
  bgInfo: { backgroundColor: "#6b7280" },
});

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "critical": return styles.bgCritical;
    case "high": return styles.bgHigh;
    case "medium": return styles.bgMedium;
    case "low": return styles.bgLow;
    default: return styles.bgInfo;
  }
};

interface VulnerabilityWithImages extends Doc<"vulnerabilities"> {
    imageUrls?: string[] | null;
}

interface ReportProps {
  projectName: string;
  findings: VulnerabilityWithImages[]; 
}

export const PdfReport = ({ projectName, findings }: ReportProps) => {
  const total = findings.length;
  const critical = findings.filter(f => f.severity === "critical").length;
  const high = findings.filter(f => f.severity === "high").length;
  const medium = findings.filter(f => f.severity === "medium").length;
  const low = findings.filter(f => f.severity === "low").length;
  const showWatermark = true;

  // Componente de Marca de Agua Reutilizable
  const Watermark = () => (
    <View style={styles.watermarkContainer} fixed>
        <Text style={styles.watermarkText}>
            GENERADO CON ROOTREPORT
        </Text>
    </View>
  );

  return (
    <Document>
      {/* --- PORTADA --- */}
      <Page size="A4" style={styles.coverPage}>
        {showWatermark && <Watermark />}
        
        <View style={styles.coverContent}>
          <Text style={styles.brandTitle}>ROOTREPORT</Text>
          <Text style={{color: '#A1A1AA', marginBottom: 40, fontSize: 12}}>
            PLATAFORMA DE GESTIÓN DE VULNERABILIDADES
          </Text>

          <Text style={styles.reportTitle}>{projectName}</Text>
          
          <View style={styles.metaContainer}>
            <View>
              <Text style={styles.metaLabel}>Fecha del Reporte</Text>
              <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Total Hallazgos</Text>
              <Text style={styles.metaValue}>{total}</Text>
            </View>
          </View>
        </View>
        
        <View style={{position: 'absolute', bottom: 40}}>
           <Text style={{color: '#52525B', fontSize: 10}}>Generado automáticamente por RootReport</Text>
        </View>
      </Page>

      {/* --- CONTENIDO --- */}
      <Page size="A4" style={styles.page}>
        
        {showWatermark && <Watermark />}

        <View style={styles.header} fixed>
          <Text style={styles.headerText}>RootReport Security Audit</Text>
          <Text style={styles.headerText}>{projectName}</Text>
        </View>

        {/* 1. RESUMEN */}
        <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
        <Text style={{marginBottom: 20, color: '#4B5563', textAlign: 'justify'}}>
          El presente documento detalla las vulnerabilidades y debilidades de seguridad identificadas. 
          Se recomienda priorizar la remediación de los hallazgos críticos y altos.
        </Text>

        <View style={styles.statsGrid}>
           <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{critical}</Text>
              <Text style={styles.statLabel}>Críticas</Text>
           </View>
           <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
              <Text style={[styles.statValue, { color: '#F97316' }]}>{high}</Text>
              <Text style={styles.statLabel}>Altas</Text>
           </View>
           <View style={[styles.statCard, { backgroundColor: '#FEFCE8' }]}>
              <Text style={[styles.statValue, { color: '#EAB308' }]}>{medium}</Text>
              <Text style={styles.statLabel}>Medias</Text>
           </View>
           <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{low}</Text>
              <Text style={styles.statLabel}>Bajas</Text>
           </View>
        </View>

        <View style={styles.divider} />

        {/* 2. LISTA DETALLADA */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Detalle Técnico</Text>

        {findings.map((vuln, index) => (
          <View key={vuln._id} wrap={false} style={styles.vulnContainer}>
            <View style={styles.vulnHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Text style={{color: '#9CA3AF', marginRight: 8, fontSize: 10}}>#{index + 1}</Text>
                 <Text style={styles.vulnTitle}>{vuln.title}</Text>
              </View>
              <View style={[styles.badge, getSeverityStyle(vuln.severity)]}>
                <Text>{vuln.severity}</Text>
              </View>
            </View>

            <View style={styles.vulnBody}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                 <View>
                    <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Estado</Text>
                    <Text style={{fontSize: 10, textTransform: 'capitalize'}}>{vuln.status}</Text>
                 </View>
                 <View>
                    <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Fecha</Text>
                    <Text style={{fontSize: 10}}>{new Date(vuln._creationTime).toLocaleDateString()}</Text>
                 </View>
              </View>

              <Text style={styles.fieldLabel}>Descripción</Text>
              <Text style={styles.fieldContent}>
                {vuln.description || "No se proporcionó una descripción técnica."}
              </Text>
              
              {vuln.imageUrls && vuln.imageUrls.length > 0 && (
                <View style={styles.evidenceContainer}>
                  <Text style={styles.fieldLabel}>EVIDENCIAS</Text>
                  {vuln.imageUrls.map((url, idx) => (
                     url ? (
                        <Image 
                            key={idx}
                            alt={`Evidencia ${idx + 1}`}
                            style={styles.evidenceImage}
                            src={url} 
                        />
                     ) : null
                  ))}
                </View>
              )}

              {vuln.remediation && (
                <>
                  <Text style={styles.fieldLabel}>Remediación Recomendada</Text>
                  <Text style={styles.fieldContent}>{vuln.remediation}</Text>
                </>
              )}
            </View>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={{fontSize: 8, color: '#9CA3AF'}}>Confidencial - Solo para uso interno</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} />
        </View>

      </Page>
    </Document>
  );
};