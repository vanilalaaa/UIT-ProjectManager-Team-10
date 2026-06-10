package com.example.se330.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.entity.Project;
import com.example.se330.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubmissionDeadlineScheduler {

    private final ProjectRepository projectRepository;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void lockExpiredSubmissions() {
        List<Project> expired =
                projectRepository.findByEndDateBeforeAndSubmissionLockedFalse(LocalDate.now());

        if (expired.isEmpty()) {
            return;
        }

        for (Project project : expired) {
            project.setSubmissionLocked(true);
        }
        projectRepository.saveAll(expired);

        log.info("Đã tự động khóa nộp bài cho {} project hết hạn", expired.size());
    }
}
