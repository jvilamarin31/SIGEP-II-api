package com.apirest.backend.services;

import com.apirest.backend.dtos.requests.curriculums.DatosPersonales.*;
import com.apirest.backend.dtos.requests.curriculums.Educacion.*;
import com.apirest.backend.dtos.requests.curriculums.ExperienciaLaboral.*;
import com.apirest.backend.dtos.requests.curriculums.GerenciaPublica.*;
import com.apirest.backend.dtos.responses.curriculums.DatosPersonales.DatosBasicosResponse;
import com.apirest.backend.dtos.responses.curriculums.DatosPersonales.DatosContactoResponse;
import com.apirest.backend.dtos.responses.curriculums.DatosPersonales.DatosDemograficosResponse;
import com.apirest.backend.exceptions.CurriculumAlreadyExistsException;
import com.apirest.backend.exceptions.CurriculumNotFoundException;
import com.apirest.backend.models.curriculum.*;
import com.apirest.backend.models.curriculum.sections.*;
import com.apirest.backend.repositories.ICurriculumRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CurriculumServiceImpTest {

    @Mock
    private ICurriculumRepository curriculumRepository;

    @InjectMocks
    private CurriculumServiceImp curriculumService;

    private String usuarioId;
    private CurriculumModelo curriculum;
    private RegistrarDatosBasicosRequest datosBasicosRequest;
    private RegistrarFormacionAcademicaRequest formacionRequest;

    @BeforeEach
    void setUp() {
        usuarioId = "67f0a1b2c3d4e5f6a7b8c9d0";
        curriculum = new CurriculumModelo();
        curriculum.setUsuarioId(usuarioId);
        curriculum.setDatosPersonales(new DatosPersonales());
        curriculum.setEducacion(new Educacion());

        datosBasicosRequest = new RegistrarDatosBasicosRequest();
        datosBasicosRequest.setNombre("Juan Perez");
        datosBasicosRequest.setTipoIdentificacion(com.apirest.backend.models.enums.Usuario.TipoIdentificacionUsuarios.CedulaDeCiudadania);
        datosBasicosRequest.setNumeroIdentificacion("123456789");
        datosBasicosRequest.setFechaNacimiento(Instant.now());
        datosBasicosRequest.setEmail("juan@test.com");
        datosBasicosRequest.setGenero(com.apirest.backend.models.enums.Curriculum.GeneroCurriculum.MASCULINO);
        datosBasicosRequest.setDocumentoIdentificacion("doc.pdf");
        datosBasicosRequest.setDocumentoVerificado(true);

        formacionRequest = new RegistrarFormacionAcademicaRequest();
        formacionRequest.setNivelAcademico(com.apirest.backend.models.enums.Curriculum.NivelAcademicoCurriculum.PREGRADO);
        formacionRequest.setNivelFormacion(com.apirest.backend.models.enums.Curriculum.NivelFormacionCurriculum.PROFESIONAL);
        formacionRequest.setPais("Colombia");
        formacionRequest.setInstitucion("UniTest");
        formacionRequest.setTituloObtenido("Ingeniero");
        formacionRequest.setEstadoEstudio(com.apirest.backend.models.enums.Curriculum.EstadoEstudioCurriculum.Finalizado);
    }

    // -------------------- Datos Personales --------------------
    @Test
    void registrarDatosPersonalesBasicos_Success() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());
        when(curriculumRepository.save(any(CurriculumModelo.class))).thenAnswer(i -> i.getArgument(0));

        curriculumService.registrarDatosPersonalesBasicos(usuarioId, datosBasicosRequest);

        ArgumentCaptor<CurriculumModelo> captor = ArgumentCaptor.forClass(CurriculumModelo.class);
        verify(curriculumRepository).save(captor.capture());
        CurriculumModelo saved = captor.getValue();
        assertNotNull(saved.getDatosPersonales().getDatosBasicos());
        assertEquals("Juan Perez", saved.getDatosPersonales().getDatosBasicos().getNombre());
    }

    @Test
    void registrarDatosPersonalesBasicos_AlreadyExists_ThrowsException() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        assertThrows(CurriculumAlreadyExistsException.class,
                () -> curriculumService.registrarDatosPersonalesBasicos(usuarioId, datosBasicosRequest));
        verify(curriculumRepository, never()).save(any());
    }

    @Test
    void actualizarDatosPersonalesBasicos_Success() {
        curriculum.getDatosPersonales().setDatosBasicos(new DatosBasicos());
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        when(curriculumRepository.save(any())).thenReturn(curriculum);

        ActualizarDatosBasicosRequest updateRequest = new ActualizarDatosBasicosRequest();
        updateRequest.setPersonaExpuestaPoliticamente(true);
        curriculumService.actualizarDatosPersonalesBasicos(usuarioId, updateRequest);

        assertTrue(curriculum.getDatosPersonales().getDatosBasicos().getPersonaExpuestaPoliticamente());
        verify(curriculumRepository).save(curriculum);
    }

    @Test
    void actualizarDatosPersonalesBasicos_NotFound_ThrowsException() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());
        assertThrows(CurriculumNotFoundException.class,
                () -> curriculumService.actualizarDatosPersonalesBasicos(usuarioId, new ActualizarDatosBasicosRequest()));
    }

    @Test
    void obtenerDatosBasicos_Success() {
        DatosBasicos datos = DatosBasicos.builder()
                .nombre("Juan Perez")
                .numeroIdentificacion("123456789")
                .build();
        curriculum.getDatosPersonales().setDatosBasicos(datos);
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));

        DatosBasicosResponse response = curriculumService.obtenerDatosBasicos(usuarioId);
        assertEquals("Juan Perez", response.getNombre());
        assertEquals("123456789", response.getNumeroIdentificacion());
    }

    @Test
    void obtenerDatosBasicos_NotFound_ThrowsException() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());
        assertThrows(CurriculumNotFoundException.class,
                () -> curriculumService.obtenerDatosBasicos(usuarioId));
    }

    // -------------------- Educación --------------------
    @Test
    void registrarFormacionAcademica_Success() {
        curriculum.setEducacion(new Educacion());
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        when(curriculumRepository.save(any(CurriculumModelo.class))).thenAnswer(i -> i.getArgument(0));

        curriculumService.registrarFormacionAcademica(usuarioId, formacionRequest);

        ArgumentCaptor<CurriculumModelo> captor = ArgumentCaptor.forClass(CurriculumModelo.class);
        verify(curriculumRepository).save(captor.capture());
        CurriculumModelo saved = captor.getValue();
        List<FormacionAcademica> list = saved.getEducacion().getFormacionesAcademicas();
        assertEquals(1, list.size());
        FormacionAcademica fa = list.get(0);
        assertEquals("PREGRADO", fa.getNivelAcademico().name());
        assertNotNull(fa.getId());
    }

    @Test
    void registrarFormacionAcademica_CurriculumNotFound_ThrowsException() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());
        assertThrows(CurriculumNotFoundException.class,
                () -> curriculumService.registrarFormacionAcademica(usuarioId, formacionRequest));
    }

    @Test
    void actualizarFormacionAcademica_Success() {
        Educacion educacion = new Educacion();
        String formacionId = new ObjectId().toString();
        FormacionAcademica formacion = FormacionAcademica.builder()
                .id(formacionId)
                .tituloObtenido("Viejo Titulo")
                .build();
        educacion.setFormacionesAcademicas(new ArrayList<>(List.of(formacion)));
        curriculum.setEducacion(educacion);
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));

        ActualizarFormacionAcademicaRequest updateRequest = new ActualizarFormacionAcademicaRequest();
        updateRequest.setFormacionId(formacionId);
        updateRequest.setProgramaAcademico("Nuevo Programa");
        updateRequest.setSemestresAprobados(8);
        curriculumService.actualizarFormacionAcademica(usuarioId, updateRequest);

        assertEquals("Nuevo Programa", formacion.getProgramaAcademico());
        assertEquals(8, formacion.getSemestresAprobados());
        verify(curriculumRepository).save(curriculum);
    }

    @Test
    void actualizarFormacionAcademica_NotFound_ThrowsException() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        curriculum.setEducacion(new Educacion());
        curriculum.getEducacion().setFormacionesAcademicas(new ArrayList<>()); // lista vacía
        ActualizarFormacionAcademicaRequest req = new ActualizarFormacionAcademicaRequest();
        req.setFormacionId("id-inexistente");
        assertThrows(CurriculumNotFoundException.class,
                () -> curriculumService.actualizarFormacionAcademica(usuarioId, req));
    }

    @Test
    void obtenerTodasFormacionesAcademicas_Success() {
        Educacion educacion = new Educacion();
        FormacionAcademica fa1 = FormacionAcademica.builder().id("1").tituloObtenido("T1").build();
        FormacionAcademica fa2 = FormacionAcademica.builder().id("2").tituloObtenido("T2").build();
        educacion.setFormacionesAcademicas(new ArrayList<>(List.of(fa1, fa2)));
        curriculum.setEducacion(educacion);
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));

        var result = curriculumService.obtenerTodasFormacionesAcademicas(usuarioId);
        assertEquals(2, result.size());
        assertEquals("T1", result.get(0).getTituloObtenido());
    }

    @Test
    void obtenerTodasFormacionesAcademicas_Empty_ReturnsEmptyList() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        var result = curriculumService.obtenerTodasFormacionesAcademicas(usuarioId);
        assertTrue(result.isEmpty());
    }

    // -------------------- Experiencia Laboral --------------------
    @Test
    void registrarExperienciaLaboral_Success() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        RegistrarExperienciaLaboralRequest expRequest = new RegistrarExperienciaLaboralRequest();
        expRequest.setTipoEntidad(com.apirest.backend.models.enums.Curriculum.TipoEntidadCurriculum.PUBLICA);
        expRequest.setNombreEntidad("Entidad X");
        expRequest.setPais("Colombia");
        expRequest.setDepartamento("Valle");
        expRequest.setMunicipio("Cali");
        expRequest.setDireccionEntidad("Calle 1");
        expRequest.setDependencia("TI");
        expRequest.setNivelJerarquicoEmpleo(com.apirest.backend.models.enums.Curriculum.NivelJerarquicoEmpleoCurriculum.PROFESIONAL);
        expRequest.setCargo("Ingeniero");
        expRequest.setTrabajoActual(true);
        expRequest.setFechaIngreso(Instant.now());
        expRequest.setJornadaLaboral(com.apirest.backend.models.enums.Curriculum.JornadaLaboralCurriculum.TIEMPO_COMPLETO);
        expRequest.setTiempoExperiencia(12);
        when(curriculumRepository.save(any())).thenReturn(curriculum);

        curriculumService.registrarExperienciaLaboral(usuarioId, expRequest);

        ArgumentCaptor<CurriculumModelo> captor = ArgumentCaptor.forClass(CurriculumModelo.class);
        verify(curriculumRepository).save(captor.capture());
        List<ExperienciaLaboral> list = captor.getValue().getExperienciasLaborales();
        assertEquals(1, list.size());
        assertEquals("Entidad X", list.get(0).getNombreEntidad());
        assertNotNull(list.get(0).getId());
    }

    @Test
    void actualizarExperienciaLaboral_Success() {
        String expId = new ObjectId().toString();
        ExperienciaLaboral exp = ExperienciaLaboral.builder()
                .id(expId)
                .certificadoLaboral("old.pdf")
                .build();
        curriculum.setExperienciasLaborales(new ArrayList<>(List.of(exp)));
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));

        ActualizarExperienciaLaboralRequest updateReq = new ActualizarExperienciaLaboralRequest();
        updateReq.setExperienciaLaboralId(expId);
        updateReq.setCertificadoLaboral("new.pdf");
        updateReq.setDocumentoVerificado(true);
        curriculumService.actualizarExperienciaLaboral(usuarioId, updateReq);

        assertEquals("new.pdf", exp.getCertificadoLaboral());
        assertTrue(exp.getDocumentoVerificado());
        verify(curriculumRepository).save(curriculum);
    }

    // -------------------- Gerencia Pública --------------------
    @Test
    void registrarPublicacion_Success() {
        curriculum.setGerenciaPublica(new GerenciaPublica());
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        RegistrarPublicacionRequest pubRequest = new RegistrarPublicacionRequest();
        pubRequest.setArticulo(com.apirest.backend.models.enums.Curriculum.ArticuloCurriculum.REVISTA_INDEXADA);
        pubRequest.setNombreArticulo("Articulo Test");
        pubRequest.setLibroResultadoInvestigacion(com.apirest.backend.models.enums.Curriculum.LibroResultadoInvestigacionCurriculum.ARTICULO_DE_REVISTA);
        pubRequest.setNombreLibroRevista("Revista");
        pubRequest.setTiposProduccionBibliografica(com.apirest.backend.models.enums.Curriculum.TiposProduccionBibliograficaCurriculum.DOCUMENTO_TRABAJO);
        pubRequest.setNombrePublicacion("Publicacion");

        curriculumService.registrarPublicacion(usuarioId, pubRequest);
        verify(curriculumRepository).save(curriculum);
        assertNotNull(curriculum.getGerenciaPublica().getPublicaciones());
        assertEquals(1, curriculum.getGerenciaPublica().getPublicaciones().size());
    }

    @Test
    void obtenerTodasPublicaciones_Empty_ReturnsEmptyList() {
        when(curriculumRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(curriculum));
        var result = curriculumService.obtenerTodasPublicaciones(usuarioId);
        assertTrue(result.isEmpty());
    }
}