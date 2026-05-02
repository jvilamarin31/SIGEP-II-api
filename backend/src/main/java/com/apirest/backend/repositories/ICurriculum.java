package com.apirest.backend.repositories;

import com.apirest.backend.models.curriculum.CurriculumModelo;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ICurriculum extends MongoRepository <CurriculumModelo, String> {
}
