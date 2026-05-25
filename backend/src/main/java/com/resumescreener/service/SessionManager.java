package com.resumescreener.service;

import com.resumescreener.model.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class SessionManager {

    private final ConcurrentHashMap<String, Session> sessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public SessionManager() {
        scheduler.scheduleAtFixedRate(this::cleanupExpiredSessions, 1, 1, TimeUnit.HOURS);
    }

    public Session createSession(String resumeFileName, String resumeText, String jobDescription) {
        Session session = new Session(resumeFileName, resumeText, jobDescription);
        sessions.put(session.getId(), session);
        log.info("Session created: {}", session.getId());
        return session;
    }

    public Session getSession(String sessionId) {
        Session session = sessions.get(sessionId);
        if (session == null) {
            throw new RuntimeException("Session not found: " + sessionId);
        }
        if (session.isExpired()) {
            sessions.remove(sessionId);
            throw new RuntimeException("Session expired: " + sessionId);
        }
        return session;
    }

    public void updateSession(Session session) {
        sessions.put(session.getId(), session);
        log.debug("Session updated: {}", session.getId());
    }

    public void deleteSession(String sessionId) {
        sessions.remove(sessionId);
        log.info("Session deleted: {}", sessionId);
    }

    private void cleanupExpiredSessions() {
        log.info("Cleaning up expired sessions");
        sessions.entrySet().removeIf(entry -> entry.getValue().isExpired());
        log.info("Cleanup complete. Active sessions: {}", sessions.size());
    }

    public int getActiveSessionCount() {
        return sessions.size();
    }
}
