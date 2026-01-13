package com.core.ksa.repository;

import com.core.ksa.domain.MarketPost;
import com.core.ksa.domain.QMarketPost;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MarketPostRepositoryCustomImpl implements MarketPostRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<MarketPost> findAllByType(MarketPost.TradeType type, Pageable pageable) {
        QMarketPost marketPost = QMarketPost.marketPost;

        List<MarketPost> content = queryFactory
                .selectFrom(marketPost)
                .where(typeEq(type))
                .orderBy(marketPost.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = queryFactory
                .selectFrom(marketPost)
                .where(typeEq(type))
                .fetch().size();

        return new PageImpl<>(content, pageable, total);
    }

    private BooleanExpression typeEq(MarketPost.TradeType type) {
        return type != null ? QMarketPost.marketPost.type.eq(type) : null;
    }
}
