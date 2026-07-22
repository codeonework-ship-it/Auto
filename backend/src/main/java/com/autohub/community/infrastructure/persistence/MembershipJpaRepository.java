package com.autohub.community.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface MembershipJpaRepository extends JpaRepository<MembershipEntity, MembershipId> {

    List<MembershipEntity> findByCommunityId(UUID communityId);

    List<MembershipEntity> findByUserId(UUID userId);

    boolean existsByCommunityIdAndUserId(UUID communityId, UUID userId);

    long countByCommunityId(UUID communityId);

    @Modifying
    @Transactional
    void deleteByCommunityIdAndUserId(UUID communityId, UUID userId);
}
