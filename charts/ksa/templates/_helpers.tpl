{{/*
Expand the name of the chart.
*/}}
{{- define "lighthouse.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "lighthouse.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "lighthouse.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "lighthouse.labels" -}}
helm.sh/chart: {{ include "lighthouse.chart" . }}
{{ include "lighthouse.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "lighthouse.selectorLabels" -}}
app.kubernetes.io/name: {{ include "lighthouse.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "lighthouse.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "lighthouse.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}


{{- define "lighthouse.postgresql.fullname" -}}
{{- if .Values.postgresql.fullnameOverride -}}
{{- .Values.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.postgresql.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name "lighthouse-postgresql" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "lighthouse.redis.fullname" -}}
{{- if .Values.redis.fullnameOverride -}}
{{- .Values.redis.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.redis.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name "lighthouse-redis" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}


{{/*
Set postgres host
*/}}
{{- define "lighthouse.postgresql.host" -}}
{{- if .Values.postgresql.enabled -}}
{{- template "lighthouse.postgresql.fullname" . -}}
{{- else -}}
{{- .Values.postgresql.postgresqlHost -}}
{{- end -}}
{{- end -}}

{{/*
Set postgres secret
*/}}
{{- define "lighthouse.postgresql.secret" -}}
{{- if .Values.postgresql.enabled -}}
{{- template "lighthouse.postgresql.fullname" . -}}
{{- else -}}
{{- template "lighthouse.fullname" . -}}
{{- end -}}
{{- end -}}

{{/*
Set postgres secretKey
*/}}
{{- define "lighthouse.postgresql.secretKey" -}}
{{- if .Values.postgresql.enabled -}}
"postgresql-password"
{{- else -}}
{{- default "postgresql-password" .Values.postgresql.existingSecretKey | quote -}}
{{- end -}}
{{- end -}}

{{/*
Set postgres port
*/}}
{{- define "lighthouse.postgresql.port" -}}
{{- if .Values.postgresql.enabled -}}
    5432
{{- else -}}
{{- default 5432 .Values.postgresql.postgresqlPort -}}
{{- end -}}
{{- end -}}

{{/*
Set redis host
*/}}
{{- define "lighthouse.redis.host" -}}
{{- if .Values.redis.enabled -}}
{{- template "lighthouse.redis.fullname" . -}}-master
{{- else -}}
{{- .Values.redis.host }}
{{- end -}}
{{- end -}}

{{/*
Set redis secret
*/}}
{{- define "lighthouse.redis.secret" -}}
{{- if .Values.redis.enabled -}}
{{- template "lighthouse.redis.fullname" . -}}
{{- else -}}
{{- template "lighthouse.fullname" . -}}
{{- end -}}
{{- end -}}

{{/*
Set redis secretKey
*/}}
{{- define "lighthouse.redis.secretKey" -}}
{{- if .Values.redis.enabled -}}
"redis-password"
{{- else -}}
{{- default "redis-password" .Values.redis.existingSecretKey | quote -}}
{{- end -}}
{{- end -}}

{{/*
Set redis port
*/}}
{{- define "lighthouse.redis.port" -}}
{{- if .Values.redis.enabled -}}
    6379
{{- else -}}
{{- default 6379 .Values.redis.port -}}
{{- end -}}
{{- end -}}

{{/*
Set redis password
*/}}
{{- define "lighthouse.redis.password" -}}
{{- if .Values.redis.enabled -}}
{{- default "redis" .Values.redis.auth.password | quote -}}
{{- else -}}
{{- default "redis" .Values.redis.password | quote -}}
{{- end -}}
{{- end -}}

{{/*
Set redis URL
*/}}
{{- define "lighthouse.redis.url" -}}
{{- if .Values.redis.enabled -}}
    "redis://:{{ .Values.redis.auth.password }}@{{ template "lighthouse.redis.host" . }}:{{ template "lighthouse.redis.port" . }}"
{{- else if .Values.env.REDIS_TLS -}}
    "rediss://:{{ .Values.redis.password }}@{{ .Values.redis.host }}:{{ .Values.redis.port }}"
{{- else -}}
    "redis://:{{ .Values.redis.password }}@{{ .Values.redis.host }}:{{ .Values.redis.port }}"
{{- end -}}
{{- end -}}

{{- define "rollme" -}}
{{- if .Values.rollme.enabled -}}
    {{ randAlphaNum 5 | quote }}
{{- else -}}
    "0"
{{- end -}}
{{- end -}}
