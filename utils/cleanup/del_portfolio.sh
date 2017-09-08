#!/usr/bin/env bash

set -xu

REGION="${REGION:-eu-west-1}"

PORTFOLIO=$(aws servicecatalog list-portfolios --region "${REGION}" --query "PortfolioDetails[?DisplayName=='ALCloud'].Id" --output text)

# Disassociate Products and Delete them

PRODUCTS=$(aws servicecatalog search-products-as-admin --portfolio-id "${PORTFOLIO}" --region "${REGION}" --query "ProductViewDetails[].ProductViewSummary.ProductId" --output text)

for product in ${PRODUCTS} ; do
	aws servicecatalog disassociate-product-from-portfolio \
		--portfolio-id "${PORTFOLIO}" \
		--region "${REGION}" \
		--product-id "${product}"
done

for product in ${PRODUCTS} ; do
	aws servicecatalog delete-product \
		--region "${REGION}" \
		--id "${product}"
done


# Delete Constraints

CONSTRAINTS=$(aws servicecatalog list-constraints-for-portfolio --portfolio-id "${PORTFOLIO}" --region "${REGION}" --query "ConstraintDetails[].ConstraintId" --output text)

for constraint in ${CONSTRAINTS} ; do
	aws servicecatalog delete-constraint \
		--region "${REGION}" \
		--id "${constraint}"
done


# Disassociate Principals

PRINCIPALS=$(aws servicecatalog list-principals-for-portfolio --portfolio-id "${PORTFOLIO}" --region "${REGION}" --query "Principals[].PrincipalARN" --output text)

for principal in ${PRINCIPALS} ; do
	aws servicecatalog disassociate-principal-from-portfolio \
		--portfolio-id "${PORTFOLIO}" \
		--region "${REGION}" \
		--principal-arn "${principal}"
done


# Finally delete the Portfolio Itself
aws servicecatalog delete-portfolio --id "${PORTFOLIO}" --region "${REGION}"
